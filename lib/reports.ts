/**
 * Queries de datos para la página de reportes.
 * Todas corren en el servidor (Server Component o Route Handler).
 */
import { db } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/categories";

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export interface MonthlyBarData {
  month:    string;   // "Ene", "Feb", …
  ingresos: number;
  gastos:   number;
  balance:  number;
}

export interface CategoryIncomeData {
  category: string;
  total:    number;
}

export interface TopServiceData {
  name:  string;
  count: number;
  total: number;
}

export interface CancellationData {
  total:     number;
  completed: number;
  cancelled: number;
  rate:      number;   // 0-100 porcentaje
}

export interface ClientSegmentData {
  label: string;
  value: number;
  fill:  string;
}

// día 0=Dom … 6=Sáb, hora 0-23
export interface HeatmapCell {
  day:   number;
  hour:  number;
  count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Ingresos vs gastos por mes (últimos 6 meses) ────────────────────────────

export async function getMonthlyBarData(): Promise<MonthlyBarData[]> {
  const now   = new Date();
  const months: MonthlyBarData[] = [];

  // Construir las 6 ventanas de mes
  for (let i = 5; i >= 0; i--) {
    const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const [incomeAgg, expenseAgg] = await Promise.all([
      db.appointment.aggregate({
        _sum: { totalCharged: true },
        where: { status: "COMPLETED", scheduledAt: { gte: from, lte: to } },
      }),
      db.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: from, lte: to } },
      }),
    ]);

    const ingresos = incomeAgg._sum.totalCharged  ?? 0;
    const gastos   = expenseAgg._sum.amount        ?? 0;

    months.push({
      month:    MONTH_NAMES[d.getMonth()],
      ingresos,
      gastos,
      balance:  ingresos - gastos,
    });
  }

  return months;
}

// ─── Ingresos por categoría de servicio (mes actual) ─────────────────────────

export async function getCategoryIncomeData(year: number, month: number): Promise<CategoryIncomeData[]> {
  const from = new Date(year, month, 1);
  const to   = new Date(year, month + 1, 0, 23, 59, 59);

  const items = await db.appointmentItem.findMany({
    where: {
      appointment: {
        status:      "COMPLETED",
        scheduledAt: { gte: from, lte: to },
      },
    },
    include: { service: { select: { category: true } } },
  });

  const totals: Record<string, number> = {};
  for (const item of items) {
    const cat = item.service.category;
    totals[cat] = (totals[cat] ?? 0) + (item.finalPrice ?? item.priceAtBooking);
  }

  return Object.entries(totals)
    .map(([category, total]) => ({
      category: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

// ─── Top 5 servicios más vendidos (mes actual) ───────────────────────────────

export async function getTopServices(year: number, month: number): Promise<TopServiceData[]> {
  const from = new Date(year, month, 1);
  const to   = new Date(year, month + 1, 0, 23, 59, 59);

  const items = await db.appointmentItem.findMany({
    where: {
      appointment: {
        status:      "COMPLETED",
        scheduledAt: { gte: from, lte: to },
      },
    },
    include: { service: { select: { name: true } } },
  });

  const map: Record<string, { count: number; total: number }> = {};
  for (const item of items) {
    const name = item.service.name;
    if (!map[name]) map[name] = { count: 0, total: 0 };
    map[name].count++;
    map[name].total += item.finalPrice ?? item.priceAtBooking;
  }

  return Object.entries(map)
    .map(([name, { count, total }]) => ({ name, count, total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ─── Tasa de cancelación (últimos 3 meses) ───────────────────────────────────

export async function getCancellationData(): Promise<CancellationData> {
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  from.setDate(1);
  from.setHours(0, 0, 0, 0);

  const [completed, cancelled] = await Promise.all([
    db.appointment.count({ where: { status: "COMPLETED",  createdAt: { gte: from } } }),
    db.appointment.count({ where: { status: "CANCELLED", createdAt: { gte: from } } }),
  ]);

  const total = completed + cancelled;
  return {
    total,
    completed,
    cancelled,
    rate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
  };
}

// ─── Clientes nuevos vs recurrentes (mes actual) ─────────────────────────────

export async function getClientSegmentData(year: number, month: number): Promise<ClientSegmentData[]> {
  const from = new Date(year, month, 1);
  const to   = new Date(year, month + 1, 0, 23, 59, 59);

  // Clientes con turno completado en el mes
  const appts = await db.appointment.findMany({
    where: { status: "COMPLETED", scheduledAt: { gte: from, lte: to } },
    select: { clientId: true, client: { select: { createdAt: true } } },
  });

  let newClients = 0;
  let returning  = 0;

  for (const a of appts) {
    const clientCreated = a.client.createdAt;
    // Es "nuevo" si se creó dentro del mes
    if (clientCreated >= from && clientCreated <= to) {
      newClients++;
    } else {
      returning++;
    }
  }

  return [
    { label: "Nuevas",      value: newClients, fill: "#6B7F4F" },
    { label: "Recurrentes", value: returning,  fill: "#B8A668" },
  ];
}

// ─── Heatmap: horarios más demandados (últimos 3 meses) ──────────────────────

export async function getHeatmapData(): Promise<HeatmapCell[]> {
  const from = new Date();
  from.setMonth(from.getMonth() - 3);

  const appts = await db.appointment.findMany({
    where: {
      status:      { in: ["CONFIRMED", "COMPLETED"] },
      scheduledAt: { gte: from, not: null },
    },
    select: { scheduledAt: true },
  });

  const counts: Record<string, number> = {};
  for (const a of appts) {
    if (!a.scheduledAt) continue;
    const key = `${a.scheduledAt.getDay()}-${a.scheduledAt.getHours()}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  // Generar todas las celdas (7 días × 10 horas laborales 8-18)
  const cells: HeatmapCell[] = [];
  for (let day = 1; day <= 6; day++) {          // lunes a sábado
    for (let hour = 8; hour <= 18; hour++) {
      cells.push({ day, hour, count: counts[`${day}-${hour}`] ?? 0 });
    }
  }

  return cells;
}

// ─── Función principal que ejecuta todo en paralelo ──────────────────────────

export async function getAllReportData(year: number, month: number) {
  const [monthly, categoryIncome, topServices, cancellation, clientSegment, heatmap] =
    await Promise.all([
      getMonthlyBarData(),
      getCategoryIncomeData(year, month),
      getTopServices(year, month),
      getCancellationData(),
      getClientSegmentData(year, month),
      getHeatmapData(),
    ]);

  return { monthly, categoryIncome, topServices, cancellation, clientSegment, heatmap };
}
