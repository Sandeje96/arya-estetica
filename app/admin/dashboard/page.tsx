import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CalendarDays, Users, TrendingUp, Clock,
  TrendingDown, Gift, Zap, ArrowRight, CheckCircle2,
} from "lucide-react";
import { RemindersWidget, type PendingReminder } from "@/components/admin/RemindersWidget";
import { formatPrice } from "@/lib/formatting";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata: Metadata = { title: "Dashboard · Admin" };
export const dynamic = "force-dynamic";

// ─── Ventanas de recordatorio ─────────────────────────────────────────────────
const WINDOW_1DAY_MIN  = 20 * 60 * 60 * 1000;
const WINDOW_1DAY_MAX  = 26 * 60 * 60 * 1000;
const WINDOW_HOURS_MIN =  2 * 60 * 60 * 1000;
const WINDOW_HOURS_MAX =  4 * 60 * 60 * 1000;

// ─── Queries ──────────────────────────────────────────────────────────────────

async function getStats(now: Date) {
  const weekStart  = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd    = endOfWeek(now,   { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);

  try {
    const [pendingCount, weekCount, clientCount, monthlyIncome, monthlyExpenses, pendingGiftCards] =
      await Promise.all([
        db.appointment.count({ where: { status: "PENDING" } }),
        db.appointment.count({
          where: {
            status:      { in: ["CONFIRMED", "COMPLETED"] },
            scheduledAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        db.client.count(),
        db.appointment.aggregate({
          _sum: { totalCharged: true },
          where: { status: "COMPLETED", scheduledAt: { gte: monthStart, lte: monthEnd } },
        }),
        db.expense.aggregate({
          _sum: { amount: true },
          where: { date: { gte: monthStart, lte: monthEnd } },
        }),
        db.giftCard.count({ where: { status: "PENDING_PICKUP" } }),
      ]);

    const income   = monthlyIncome._sum.totalCharged   ?? 0;
    const expenses = monthlyExpenses._sum.amount       ?? 0;

    return {
      pendingCount,
      weekCount,
      clientCount,
      monthlyIncome:    income,
      monthlyExpenses:  expenses,
      monthlyBalance:   income - expenses,
      pendingGiftCards,
    };
  } catch {
    return {
      pendingCount: 0, weekCount: 0, clientCount: 0,
      monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0, pendingGiftCards: 0,
    };
  }
}

async function getPendingReminders(now: Date): Promise<PendingReminder[]> {
  try {
    const candidates = await db.appointment.findMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: { not: null },
        OR: [
          {
            reminder1DaySent: false,
            scheduledAt: {
              gte: new Date(now.getTime() + WINDOW_1DAY_MIN),
              lte: new Date(now.getTime() + WINDOW_1DAY_MAX),
            },
          },
          {
            reminderHoursSent: false,
            scheduledAt: {
              gte: new Date(now.getTime() + WINDOW_HOURS_MIN),
              lte: new Date(now.getTime() + WINDOW_HOURS_MAX),
            },
          },
        ],
      },
      include: { client: { select: { firstName: true, lastName: true, whatsapp: true } } },
    });

    return candidates.map((appt) => {
      const msUntil = appt.scheduledAt!.getTime() - now.getTime();
      const is1Day  = msUntil >= WINDOW_1DAY_MIN && !appt.reminder1DaySent;
      return {
        appointmentId:  appt.id,
        clientName:     `${appt.client.firstName} ${appt.client.lastName}`,
        clientWhatsapp: appt.client.whatsapp,
        scheduledAt:    appt.scheduledAt!.toISOString(),
        reminderType:   (is1Day ? "1day" : "hours") as "1day" | "hours",
      };
    });
  } catch {
    return [];
  }
}

// Próximos turnos: hoy + 6 días siguientes
async function getUpcomingAppointments(now: Date) {
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end   = addDays(start, 7);

  try {
    return await db.appointment.findMany({
      where: {
        status:      "CONFIRMED",
        scheduledAt: { gte: start, lt: end },
      },
      include: {
        client: { select: { firstName: true, lastName: true } },
        items:  { include: { service: { select: { name: true } } }, take: 2 },
      },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const now = new Date();

  const [session, stats, reminders, upcomingRaw] = await Promise.all([
    auth(),
    getStats(now),
    getPendingReminders(now),
    getUpcomingAppointments(now),
  ]);

  // Serializar fechas
  const upcoming = upcomingRaw.map((a) => ({
    id:       a.id,
    clientName: `${a.client.firstName} ${a.client.lastName}`,
    scheduledAt: a.scheduledAt!.toISOString(),
    services: a.items.map((i) => i.service.name),
    isToday:  a.scheduledAt!.toDateString() === now.toDateString(),
    dayLabel: a.scheduledAt!.toDateString() === now.toDateString()
      ? "Hoy"
      : format(a.scheduledAt!, "EEEE d/M", { locale: es }),
    timeLabel: format(a.scheduledAt!, "HH:mm"),
  }));

  const monthLabel = format(now, "MMMM yyyy", { locale: es });

  // Porcentaje de gastos sobre ingresos (para barra visual)
  const expensePct = stats.monthlyIncome > 0
    ? Math.min(Math.round((stats.monthlyExpenses / stats.monthlyIncome) * 100), 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Bienvenida ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-light text-arya-green-dark">
            Bienvenida{session?.user?.name ? `, ${session.user.name}` : ""} 🌿
          </h1>
          <p className="font-sans text-sm text-arya-text-muted mt-1 capitalize">
            {format(now, "EEEE d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        {stats.pendingCount > 0 && (
          <Link
            href="/admin/turnos"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-arya-gold/15 border border-arya-gold/30 text-amber-700 font-sans text-sm font-medium hover:bg-arya-gold/25 transition-colors"
          >
            <Clock size={15} aria-hidden />
            {stats.pendingCount} turno{stats.pendingCount !== 1 ? "s" : ""} pendiente{stats.pendingCount !== 1 ? "s" : ""}
            <ArrowRight size={13} aria-hidden />
          </Link>
        )}
      </div>

      {/* ── Stats principales ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {([
          { label: "Pendientes",       value: stats.pendingCount.toString(),                          icon: Clock,       color: "text-arya-gold",       bg: "bg-arya-gold/10",       href: "/admin/turnos?status=PENDING" },
          { label: "Esta semana",      value: stats.weekCount.toString(),                             icon: CalendarDays,color: "text-arya-green",       bg: "bg-arya-green/10",      href: "/admin/calendario" },
          { label: "Clientes",         value: stats.clientCount.toString(),                           icon: Users,       color: "text-arya-green-dark",  bg: "bg-arya-green-dark/10", href: "/admin/turnos" },
          { label: `Ingresos ${format(now,"MMM",{locale:es})}`, value: formatPrice(stats.monthlyIncome), icon: TrendingUp,  color: "text-arya-gold",       bg: "bg-arya-gold/10",       href: "/admin/finanzas" },
        ] as const).map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex items-center gap-3 p-4 rounded-xl border border-arya-gold/20 bg-arya-cream-light hover:border-arya-gold/40 transition-colors"
          >
            <div className={`${stat.color} ${stat.bg} rounded-lg p-2 shrink-0`}>
              <stat.icon size={18} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-[11px] text-arya-text-muted">{stat.label}</p>
              <p className="font-heading text-xl font-light text-arya-green-dark truncate group-hover:text-arya-green transition-colors">
                {stat.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Balance del mes ────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-arya-gold/20 bg-arya-cream-light overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-arya-gold/10">
          <h2 className="font-heading text-lg font-light text-arya-green-dark capitalize">
            Balance · {monthLabel}
          </h2>
          <Link
            href="/admin/finanzas"
            className="font-sans text-xs text-arya-green-soft hover:text-arya-green-dark transition-colors flex items-center gap-1"
          >
            Ver finanzas <ArrowRight size={11} aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-3 divide-x divide-arya-gold/10">
          {/* Ingresos */}
          <div className="flex flex-col items-center gap-1 px-4 py-4 text-center">
            <div className="flex items-center gap-1.5 text-arya-green">
              <TrendingUp size={13} aria-hidden />
              <span className="font-sans text-[10px] uppercase tracking-wider text-arya-text-muted">Ingresos</span>
            </div>
            <p className="font-heading text-xl font-light text-arya-green-dark">
              {formatPrice(stats.monthlyIncome)}
            </p>
          </div>
          {/* Egresos */}
          <div className="flex flex-col items-center gap-1 px-4 py-4 text-center">
            <div className="flex items-center gap-1.5 text-destructive/70">
              <TrendingDown size={13} aria-hidden />
              <span className="font-sans text-[10px] uppercase tracking-wider text-arya-text-muted">Gastos</span>
            </div>
            <p className="font-heading text-xl font-light text-arya-green-dark">
              {formatPrice(stats.monthlyExpenses)}
            </p>
          </div>
          {/* Balance */}
          <div className="flex flex-col items-center gap-1 px-4 py-4 text-center">
            <span className="font-sans text-[10px] uppercase tracking-wider text-arya-text-muted">Balance</span>
            <p className={`font-heading text-xl font-light ${stats.monthlyBalance >= 0 ? "text-arya-green-dark" : "text-destructive"}`}>
              {stats.monthlyBalance >= 0 ? "+" : ""}{formatPrice(stats.monthlyBalance)}
            </p>
          </div>
        </div>
        {/* Barra de proporción gastos/ingresos */}
        {stats.monthlyIncome > 0 && (
          <div className="px-5 pb-4">
            <div className="h-1.5 rounded-full bg-arya-gold/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-arya-green transition-all"
                style={{ width: `${100 - expensePct}%` }}
                title={`${100 - expensePct}% neto`}
              />
            </div>
            <p className="font-sans text-[10px] text-arya-text-muted/60 mt-1.5 text-right">
              {expensePct}% destinado a gastos
            </p>
          </div>
        )}
      </section>

      {/* ── Fila central: recordatorios + próximos turnos ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recordatorios */}
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-light text-arya-green-dark">Recordatorios</h2>
          <RemindersWidget reminders={reminders} />
        </section>

        {/* Próximos turnos (7 días) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-light text-arya-green-dark">Próximos turnos</h2>
            <Link
              href="/admin/calendario"
              className="font-sans text-xs text-arya-green-soft hover:text-arya-green-dark transition-colors flex items-center gap-1"
            >
              Ver calendario <ArrowRight size={11} aria-hidden />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-arya-gold/20 bg-arya-cream-light text-arya-text-muted">
              <CheckCircle2 size={16} className="text-arya-green shrink-0" aria-hidden />
              <p className="font-sans text-sm">No hay turnos confirmados los próximos 7 días.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming.map((appt) => (
                <div
                  key={appt.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    appt.isToday
                      ? "border-arya-green-soft/40 bg-arya-green/5"
                      : "border-arya-gold/20 bg-arya-cream-light"
                  }`}
                >
                  {/* Día + hora */}
                  <div className="shrink-0 text-center min-w-[52px]">
                    <p className={`font-sans text-[11px] font-semibold uppercase tracking-wide ${appt.isToday ? "text-arya-green-dark" : "text-arya-text-muted"}`}>
                      {appt.dayLabel}
                    </p>
                    <p className="font-sans text-sm font-medium text-arya-green-dark">{appt.timeLabel}</p>
                  </div>
                  {/* Datos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-arya-text truncate">{appt.clientName}</p>
                    <p className="font-sans text-xs text-arya-text-muted/70 truncate">
                      {appt.services.join(", ")}
                      {appt.services.length < appt.services.length && " …"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Accesos rápidos ────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-light text-arya-green-dark">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Nuevo gasto",       href: "/admin/gastos",     icon: TrendingDown, desc: "Registrar egreso" },
            { label: "Gift Cards",         href: "/admin/gift-cards", icon: Gift,         desc: stats.pendingGiftCards > 0 ? `${stats.pendingGiftCards} pendiente${stats.pendingGiftCards !== 1 ? "s" : ""}` : "Gestionar" },
            { label: "Nueva jornada",      href: "/admin/jornadas",   icon: Zap,          desc: "Depilación láser" },
            { label: "Ver calendario",     href: "/admin/calendario", icon: CalendarDays, desc: "Vista mensual" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-2 p-4 rounded-xl border border-arya-gold/20 bg-arya-cream-light hover:border-arya-gold/50 hover:-translate-y-0.5 transition-all"
            >
              <item.icon size={18} className="text-arya-gold" aria-hidden />
              <div>
                <p className="font-sans text-sm font-medium text-arya-text group-hover:text-arya-green-dark transition-colors">
                  {item.label}
                </p>
                <p className="font-sans text-[11px] text-arya-text-muted">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
