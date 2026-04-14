import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/formatting";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  ArrowRight,
  CheckCircle2,
  Gift,
} from "lucide-react";

export const metadata: Metadata = { title: "Finanzas · Admin" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

// ─── Datos ────────────────────────────────────────────────────────────────────

async function getFinanceData(year: number, month: number) {
  const from = new Date(year, month, 1);
  const to   = new Date(year, month + 1, 0, 23, 59, 59);

  const [appointments, giftCards, expenses] = await Promise.all([
    // Turnos completados del mes
    db.appointment.findMany({
      where: {
        status:      "COMPLETED",
        scheduledAt: { gte: from, lte: to },
        totalCharged: { not: null },
      },
      include: {
        client: { select: { firstName: true, lastName: true } },
        items:  { include: { service: { select: { name: true } } } },
      },
      orderBy: { scheduledAt: "desc" },
    }),

    // Gift cards marcadas READY o REDEEMED en el mes (ingresos al cobrar)
    db.giftCard.findMany({
      where: {
        status:    { in: ["READY", "REDEEMED"] },
        updatedAt: { gte: from, lte: to },
      },
      include: {
        buyer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),

    // Gastos del mes
    db.expense.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: "desc" },
    }),
  ]);

  const ingresosTurnos   = appointments.reduce((s, a) => s + (a.totalCharged ?? 0), 0);
  const ingresosGiftCard = giftCards.reduce((s, g) => s + g.totalAmount, 0);
  const totalIngresos    = ingresosTurnos + ingresosGiftCard;
  const totalEgresos     = expenses.reduce((s, e) => s + e.amount, 0);
  const balance          = totalIngresos - totalEgresos;

  // Agrupar egresos por categoría
  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return {
    appointments,
    giftCards,
    expenses,
    ingresosTurnos,
    ingresosGiftCard,
    totalIngresos,
    totalEgresos,
    balance,
    expensesByCategory,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FinanzasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now    = new Date();
  const year   = parseInt(params.year  ?? String(now.getFullYear()), 10);
  const month  = parseInt(params.month ?? String(now.getMonth()),    10);

  let data;
  try {
    data = await getFinanceData(year, month);
  } catch {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl font-light text-arya-green-dark">Finanzas</h1>
        <p className="font-sans text-sm text-arya-text-muted">Error al cargar los datos.</p>
      </div>
    );
  }

  const monthLabel = format(new Date(year, month, 1), "MMMM yyyy", { locale: es });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const prevDate   = new Date(year, month - 1, 1);
  const nextDate   = new Date(year, month + 1, 1);
  const isCurrent  = year === now.getFullYear() && month === now.getMonth();

  const isPositive = data.balance >= 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado + navegación */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-light text-arya-green-dark">Finanzas</h1>
          <p className="font-sans text-sm text-arya-text-muted mt-0.5">
            Ingresos, egresos y balance mensual.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`?year=${prevDate.getFullYear()}&month=${prevDate.getMonth()}`}
            className="px-3 py-1.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-xs hover:bg-arya-gold/10 transition-colors"
          >←</Link>
          <span className="font-sans text-sm font-medium text-arya-text min-w-32 text-center capitalize">
            {monthLabelCap}
          </span>
          {!isCurrent && (
            <Link
              href={`?year=${nextDate.getFullYear()}&month=${nextDate.getMonth()}`}
              className="px-3 py-1.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-xs hover:bg-arya-gold/10 transition-colors"
            >→</Link>
          )}
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ingresos */}
        <div className="flex items-center gap-4 p-5 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
          <div className="shrink-0 bg-arya-green/10 text-arya-green rounded-lg p-2.5">
            <TrendingUp size={20} aria-hidden />
          </div>
          <div>
            <p className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Ingresos</p>
            <p className="font-heading text-2xl font-light text-arya-green-dark">
              {formatPrice(data.totalIngresos)}
            </p>
            {data.ingresosGiftCard > 0 && (
              <p className="font-sans text-[11px] text-arya-text-muted mt-0.5">
                Turnos {formatPrice(data.ingresosTurnos)} · Gift cards {formatPrice(data.ingresosGiftCard)}
              </p>
            )}
          </div>
        </div>

        {/* Egresos */}
        <div className="flex items-center gap-4 p-5 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
          <div className="shrink-0 bg-arya-gold/10 text-arya-gold rounded-lg p-2.5">
            <TrendingDown size={20} aria-hidden />
          </div>
          <div>
            <p className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Egresos</p>
            <p className="font-heading text-2xl font-light text-arya-green-dark">
              {formatPrice(data.totalEgresos)}
            </p>
            <p className="font-sans text-[11px] text-arya-text-muted mt-0.5">
              {data.expenses.length} registro{data.expenses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className={`flex items-center gap-4 p-5 rounded-xl border ${isPositive ? "border-arya-green/30 bg-arya-green/5" : "border-destructive/20 bg-destructive/5"}`}>
          <div className={`shrink-0 rounded-lg p-2.5 ${isPositive ? "bg-arya-green/10 text-arya-green" : "bg-destructive/10 text-destructive"}`}>
            <Scale size={20} aria-hidden />
          </div>
          <div>
            <p className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Balance</p>
            <p className={`font-heading text-2xl font-light ${isPositive ? "text-arya-green-dark" : "text-destructive"}`}>
              {isPositive ? "+" : ""}{formatPrice(data.balance)}
            </p>
            <p className="font-sans text-[11px] text-arya-text-muted mt-0.5 capitalize">
              {monthLabelCap}
            </p>
          </div>
        </div>
      </div>

      {/* ── Ingresos detalle ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-light text-arya-green-dark">
          Ingresos del mes
        </h2>

        {data.appointments.length === 0 && data.giftCards.length === 0 ? (
          <div className="px-4 py-8 rounded-xl border border-arya-gold/20 bg-arya-cream-light text-center">
            <p className="font-sans text-sm text-arya-text-muted">
              Sin ingresos registrados en {monthLabelCap.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-arya-gold/20 bg-arya-cream-light overflow-hidden">
            <ul className="divide-y divide-arya-gold/10">

              {/* Turnos completados */}
              {data.appointments.map((appt) => (
                <li key={appt.id} className="flex items-center gap-3 px-4 py-3">
                  <CheckCircle2 size={15} className="text-arya-green shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-arya-text truncate">
                      {appt.client.firstName} {appt.client.lastName}
                    </p>
                    <p className="font-sans text-xs text-arya-text-muted truncate">
                      {appt.items.map((i) => i.service.name).join(" · ")}
                    </p>
                    {appt.scheduledAt && (
                      <p className="font-sans text-[11px] text-arya-text-muted/60 mt-0.5">
                        {format(appt.scheduledAt, "d MMM HH:mm", { locale: es })}
                      </p>
                    )}
                  </div>
                  <span className="font-sans text-sm font-medium text-arya-green-dark shrink-0">
                    {formatPrice(appt.totalCharged ?? 0)}
                  </span>
                </li>
              ))}

              {/* Gift cards cobradas */}
              {data.giftCards.map((gc) => (
                <li key={gc.id} className="flex items-center gap-3 px-4 py-3">
                  <Gift size={15} className="text-arya-gold shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-arya-text truncate">
                      Gift Card — {gc.recipientName}
                    </p>
                    <p className="font-sans text-xs text-arya-text-muted truncate">
                      Comprador: {gc.buyer.firstName} {gc.buyer.lastName}
                    </p>
                  </div>
                  <span className="font-sans text-sm font-medium text-arya-green-dark shrink-0">
                    {formatPrice(gc.totalAmount)}
                  </span>
                </li>
              ))}

            </ul>

            {/* Total */}
            <div className="px-4 py-3 border-t border-arya-gold/20 flex justify-between items-center bg-arya-cream/60">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">
                Total ingresos
              </span>
              <span className="font-heading text-xl font-light text-arya-green-dark">
                {formatPrice(data.totalIngresos)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Egresos resumen ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-light text-arya-green-dark">
            Egresos del mes
          </h2>
          <Link
            href={`/admin/gastos?year=${year}&month=${month}`}
            className="flex items-center gap-1.5 font-sans text-xs text-arya-green-dark hover:underline underline-offset-4"
          >
            Ver detalle <ArrowRight size={12} aria-hidden />
          </Link>
        </div>

        {data.expenses.length === 0 ? (
          <div className="px-4 py-8 rounded-xl border border-arya-gold/20 bg-arya-cream-light text-center">
            <p className="font-sans text-sm text-arya-text-muted">
              Sin egresos registrados en {monthLabelCap.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-arya-gold/20 bg-arya-cream-light overflow-hidden">
            <ul className="divide-y divide-arya-gold/10">
              {Object.entries(data.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, total]) => (
                  <li key={cat} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-arya-text capitalize">{cat}</p>
                      <p className="font-sans text-[11px] text-arya-text-muted mt-0.5">
                        {data.expenses.filter((e) => e.category === cat).length} registro{data.expenses.filter((e) => e.category === cat).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="font-sans text-sm font-medium text-arya-text shrink-0">
                      {formatPrice(total)}
                    </span>
                  </li>
                ))}
            </ul>

            {/* Total */}
            <div className="px-4 py-3 border-t border-arya-gold/20 flex justify-between items-center bg-arya-cream/60">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">
                Total egresos
              </span>
              <span className="font-heading text-xl font-light text-arya-green-dark">
                {formatPrice(data.totalEgresos)}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
