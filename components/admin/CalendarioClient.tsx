"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Phone,
  X,
  Clock,
} from "lucide-react";
import { format, isToday, isSameDay, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { formatPrice } from "@/lib/formatting";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface Appointment {
  id: string;
  status: Status;
  scheduledAt: string;
  totalEstimated: number;
  totalCharged?: number | null;
  notes?: string | null;
  client: { firstName: string; lastName: string; whatsapp: string };
  items: { service: { name: string } }[];
}

interface CalendarioClientProps {
  appointments: Appointment[];
  year: number;
  month: number; // 0-indexed
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOW_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function buildGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // Monday = 0
  const startDow = (firstDay.getDay() + 6) % 7;

  const days: Date[] = [];

  // Días del mes anterior (relleno)
  for (let i = startDow - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  // Días del mes actual
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  // Días del mes siguiente (completar la última fila)
  const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
  for (let d = 1; d <= remaining; d++) {
    days.push(new Date(year, month + 1, d));
  }

  return days;
}

const STATUS_DOT: Record<Status, string> = {
  PENDING:   "bg-arya-gold",
  CONFIRMED: "bg-arya-green",
  COMPLETED: "bg-emerald-600",
  CANCELLED: "bg-gray-300",
};

// ─── Panel de día seleccionado ────────────────────────────────────────────────

function DayPanel({
  date,
  appointments,
  onClose,
}: {
  date: Date;
  appointments: Appointment[];
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-arya-cream animate-in slide-in-from-right-4 duration-200 lg:border-l lg:border-arya-gold/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-arya-gold/15 bg-arya-cream-light shrink-0">
        <div>
          <p className="font-heading text-xl font-light text-arya-green-dark capitalize">
            {format(date, "EEEE d", { locale: es })}
          </p>
          <p className="font-sans text-xs text-arya-text-muted capitalize">
            {format(date, "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors"
          aria-label="Cerrar panel"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      {/* Lista de turnos */}
      <div className="flex-1 overflow-y-auto p-4">
        {appointments.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarDays size={28} className="mx-auto text-arya-gold/30 mb-2" aria-hidden />
            <p className="font-sans text-sm text-arya-text-muted">Sin turnos para este día.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {appointments
              .sort((a, b) =>
                new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
              )
              .map((appt) => {
                const reminderMsg = `Hola ${appt.client.firstName}! 🌿 Te recordamos tu turno en Arya Estética hoy ${format(new Date(appt.scheduledAt), "HH:mm", { locale: es })} hs. ¡Te esperamos!`;
                const reminderLink = buildWhatsappLink(appt.client.whatsapp, reminderMsg);

                return (
                  <li
                    key={appt.id}
                    className="border border-arya-gold/20 rounded-xl bg-arya-cream-light p-3 flex flex-col gap-2"
                  >
                    {/* Hora + estado */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-arya-text-muted">
                        <Clock size={12} aria-hidden />
                        <span className="font-sans text-xs font-medium">
                          {format(new Date(appt.scheduledAt), "HH:mm")} hs
                        </span>
                      </div>
                      <AppointmentStatusBadge status={appt.status} />
                    </div>

                    {/* Cliente */}
                    <div>
                      <p className="font-sans text-sm font-medium text-arya-text">
                        {appt.client.firstName} {appt.client.lastName}
                      </p>
                      <a
                        href={`https://wa.me/${appt.client.whatsapp.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-arya-text-muted hover:text-arya-green-dark transition-colors"
                      >
                        <Phone size={10} aria-hidden />
                        {appt.client.whatsapp}
                      </a>
                    </div>

                    {/* Servicios */}
                    <ul className="flex flex-col gap-0.5">
                      {appt.items.map((item, i) => (
                        <li key={i} className="font-sans text-xs text-arya-text-muted">
                          · {item.service.name}
                        </li>
                      ))}
                    </ul>

                    {/* Total + recordar */}
                    <div className="flex items-center justify-between pt-1 border-t border-arya-gold/10">
                      <span className="font-heading text-base text-arya-green-dark">
                        {formatPrice(appt.totalCharged ?? appt.totalEstimated)}
                      </span>
                      {appt.status === "CONFIRMED" && (
                        <a
                          href={reminderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-arya-gold/30 text-arya-text-muted text-xs font-sans hover:bg-arya-gold/10 transition-colors"
                        >
                          <Phone size={11} aria-hidden />
                          Recordar
                        </a>
                      )}
                    </div>

                    {appt.notes && (
                      <p className="font-sans text-xs text-arya-text-muted/60 italic">
                        {appt.notes}
                      </p>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CalendarioClient({ appointments, year, month }: CalendarioClientProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  // Indexar turnos por día
  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const key = format(new Date(appt.scheduledAt), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), appt]);
    }
    return map;
  }, [appointments]);

  const navigate = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    router.push(
      `${pathname}?year=${d.getFullYear()}&month=${d.getMonth()}`
    );
    setSelectedDate(null);
  };

  const selectedAppointments = selectedDate
    ? (byDay.get(format(selectedDate, "yyyy-MM-dd")) ?? [])
    : [];

  const currentMonth = new Date(year, month, 1);

  return (
    <div className="flex flex-col gap-5">

      {/* Encabezado de navegación */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-light text-arya-green-dark capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-arya-gold/25 text-arya-text-muted hover:bg-arya-cream-light hover:text-arya-green-dark transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              router.push(`${pathname}?year=${now.getFullYear()}&month=${now.getMonth()}`);
              setSelectedDate(null);
            }}
            className="px-3 py-1.5 rounded-lg border border-arya-gold/25 text-arya-text-muted font-sans text-xs hover:bg-arya-cream-light hover:text-arya-green-dark transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg border border-arya-gold/25 text-arya-text-muted hover:bg-arya-cream-light hover:text-arya-green-dark transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 flex-wrap">
        {(["PENDING", "CONFIRMED", "COMPLETED"] as Status[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[s])} aria-hidden />
            <span className="font-sans text-xs text-arya-text-muted">
              {s === "PENDING" ? "Pendiente" : s === "CONFIRMED" ? "Confirmado" : "Completado"}
            </span>
          </div>
        ))}
      </div>

      {/* Grilla + panel lateral */}
      <div className="flex gap-0 border border-arya-gold/20 rounded-xl overflow-hidden">

        {/* Grilla del mes (siempre visible) */}
        <div className="flex-1 min-w-0">
          {/* Header días de la semana */}
          <div className="grid grid-cols-7 border-b border-arya-gold/15 bg-arya-cream-light">
            {DOW_LABELS.map((d) => (
              <div key={d} className="py-2 text-center font-sans text-xs text-arya-text-muted uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7">
            {grid.map((date, idx) => {
              const key  = format(date, "yyyy-MM-dd");
              const appts = byDay.get(key) ?? [];
              const inMonth  = isSameMonth(date, currentMonth);
              const today    = isToday(date);
              const selected = selectedDate ? isSameDay(date, selectedDate) : false;

              // Agrupar por estado para los dots
              const dotStatuses = [...new Set(
                appts
                  .filter((a) => a.status !== "CANCELLED")
                  .map((a) => a.status)
              )];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(isSameDay(date, selectedDate ?? new Date(0)) ? null : date)}
                  className={cn(
                    "relative min-h-[72px] p-2 border-b border-r border-arya-gold/10 text-left transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-arya-green/30",
                    !inMonth && "bg-arya-cream-light/40",
                    selected && "bg-arya-green/8 ring-2 ring-inset ring-arya-green/30",
                    !selected && appts.length > 0 && "hover:bg-arya-gold/5",
                    !selected && appts.length === 0 && "hover:bg-arya-cream-light/60",
                    // Última columna sin border-right
                    (idx + 1) % 7 === 0 && "border-r-0",
                  )}
                  aria-label={`${format(date, "d 'de' MMMM", { locale: es })}${appts.length > 0 ? `, ${appts.length} turno${appts.length !== 1 ? "s" : ""}` : ""}`}
                  aria-pressed={selected}
                >
                  {/* Número de día */}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full font-sans text-sm font-medium",
                      !inMonth && "text-arya-text-muted/30",
                      inMonth && !today && "text-arya-text",
                      today && "bg-arya-green-dark text-arya-cream",
                    )}
                  >
                    {format(date, "d")}
                  </span>

                  {/* Turnos del día */}
                  {appts.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {/* Desktop: hasta 2 nombres */}
                      <div className="hidden sm:flex flex-col gap-0.5">
                        {appts.slice(0, 2).map((a) => (
                          <span
                            key={a.id}
                            className={cn(
                              "truncate text-[10px] font-sans px-1 py-0.5 rounded",
                              a.status === "CONFIRMED" && "bg-arya-green/10 text-arya-green-dark",
                              a.status === "PENDING"   && "bg-arya-gold/15 text-amber-700",
                              a.status === "COMPLETED" && "bg-emerald-50 text-emerald-700",
                            )}
                          >
                            {format(new Date(a.scheduledAt), "HH:mm")} {a.client.firstName}
                          </span>
                        ))}
                        {appts.length > 2 && (
                          <span className="text-[10px] font-sans text-arya-text-muted/60">
                            +{appts.length - 2} más
                          </span>
                        )}
                      </div>

                      {/* Mobile: solo dots */}
                      <div className="flex sm:hidden gap-1 mt-0.5">
                        {dotStatuses.map((s) => (
                          <span key={s} className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[s])} aria-hidden />
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel lateral del día seleccionado — solo desktop */}
        {selectedDate && (
          <div className="hidden lg:block w-72 shrink-0">
            <DayPanel
              date={selectedDate}
              appointments={selectedAppointments}
              onClose={() => setSelectedDate(null)}
            />
          </div>
        )}
      </div>

      {/* Panel de día seleccionado — bottom sheet en mobile */}
      {selectedDate && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSelectedDate(null)}
            aria-hidden
          />
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden max-h-[80svh] rounded-t-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <DayPanel
              date={selectedDate}
              appointments={selectedAppointments}
              onClose={() => setSelectedDate(null)}
            />
          </div>
        </>
      )}

      {/* Resumen del mes */}
      {appointments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as Status[]).map((s) => {
            const count = appointments.filter((a) => a.status === s).length;
            const labels: Record<Status, string> = {
              PENDING:   "Pendientes",
              CONFIRMED: "Confirmados",
              COMPLETED: "Completados",
              CANCELLED: "Cancelados",
            };
            return (
              <div key={s} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-arya-gold/20 bg-arya-cream-light">
                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", STATUS_DOT[s])} aria-hidden />
                <div>
                  <p className="font-sans text-xs text-arya-text-muted">{labels[s]}</p>
                  <p className="font-heading text-xl font-light text-arya-green-dark">{count}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
