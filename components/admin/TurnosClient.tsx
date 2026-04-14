"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { ConfirmModal } from "./ConfirmModal";
import { CompleteModal } from "./CompleteModal";
import { CancelModal } from "./CancelModal";
import { formatPrice } from "@/lib/formatting";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface AppointmentItem {
  id: string;
  priceAtBooking: number;
  finalPrice?: number | null;
  service: { name: string };
}

interface Appointment {
  id: string;
  status: Status;
  scheduledAt?: string | null;
  totalEstimated: number;
  totalCharged?: number | null;
  notes?: string | null;
  createdAt: string;
  client: { firstName: string; lastName: string; whatsapp: string };
  items: AppointmentItem[];
}

type Modal =
  | { type: "confirm"; appointment: Appointment }
  | { type: "complete"; appointment: Appointment }
  | { type: "cancel"; appointment: Appointment }
  | { type: "delete"; appointment: Appointment }
  | null;

const STATUS_LABELS: Record<string, string> = {
  ALL:       "Todos",
  PENDING:   "Pendientes",
  CONFIRMED: "Confirmados",
  COMPLETED: "Completados",
  CANCELLED: "Cancelados",
};

// ─── Row (expandible en mobile) ───────────────────────────────────────────────

function AppointmentRow({
  appt,
  onAction,
}: {
  appt: Appointment;
  onAction: (modal: Modal) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const clientName = `${appt.client.firstName} ${appt.client.lastName}`;

  const reminderMsg = appt.scheduledAt
    ? `Hola ${appt.client.firstName}! 🌿 Te recordamos tu turno en Arya Estética mañana ${format(new Date(appt.scheduledAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })} hs. ¡Te esperamos!`
    : "";
  const reminderLink = reminderMsg
    ? buildWhatsappLink(appt.client.whatsapp, reminderMsg)
    : "#";

  return (
    <>
      {/* Fila principal */}
      <tr className="border-b border-arya-gold/10 hover:bg-arya-cream-light/50 transition-colors">
        {/* Cliente */}
        <td className="px-4 py-3">
          <div>
            <p className="font-sans text-sm font-medium text-arya-text">{clientName}</p>
            <a
              href={`https://wa.me/${appt.client.whatsapp.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-arya-text-muted hover:text-arya-green-dark transition-colors mt-0.5"
            >
              <Phone size={10} aria-hidden />
              {appt.client.whatsapp}
            </a>
          </div>
        </td>

        {/* Servicios + expander */}
        <td className="px-4 py-3 hidden sm:table-cell">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-arya-text-muted hover:text-arya-text transition-colors"
            aria-expanded={expanded}
          >
            {appt.items.length} servicio{appt.items.length !== 1 ? "s" : ""}
            {expanded ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
          </button>
        </td>

        {/* Estado */}
        <td className="px-4 py-3">
          <AppointmentStatusBadge status={appt.status} />
        </td>

        {/* Fecha */}
        <td className="px-4 py-3 hidden md:table-cell">
          {appt.scheduledAt ? (
            <div className="text-xs font-sans">
              <p className="text-arya-text">
                {format(new Date(appt.scheduledAt), "d MMM yyyy", { locale: es })}
              </p>
              <p className="text-arya-text-muted">
                {format(new Date(appt.scheduledAt), "HH:mm", { locale: es })} hs
              </p>
            </div>
          ) : (
            <span className="text-xs text-arya-text-muted/50 italic">Sin asignar</span>
          )}
        </td>

        {/* Total */}
        <td className="px-4 py-3 hidden lg:table-cell text-right">
          <span className="font-heading text-base text-arya-text">
            {formatPrice(appt.totalCharged ?? appt.totalEstimated)}
          </span>
          {appt.totalCharged == null && (
            <p className="text-[10px] text-arya-text-muted/50">estimado</p>
          )}
        </td>

        {/* Acciones */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 justify-end">
            {appt.status === "PENDING" && (
              <button
                onClick={() => onAction({ type: "confirm", appointment: appt })}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-arya-green-dark text-arya-cream text-xs font-sans hover:bg-arya-green transition-colors"
                title="Confirmar turno"
              >
                <CalendarCheck size={12} aria-hidden />
                <span className="hidden sm:inline">Confirmar</span>
              </button>
            )}
            {appt.status === "CONFIRMED" && (
              <>
                <a
                  href={reminderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-arya-gold/30 text-arya-text-muted text-xs font-sans hover:bg-arya-gold/10 transition-colors"
                  title="Enviar recordatorio"
                >
                  <Clock size={12} aria-hidden />
                  <span className="hidden lg:inline">Recordar</span>
                </a>
                <button
                  onClick={() => onAction({ type: "complete", appointment: appt })}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-700 text-white text-xs font-sans hover:bg-emerald-800 transition-colors"
                  title="Marcar completado"
                >
                  <CheckCircle2 size={12} aria-hidden />
                  <span className="hidden sm:inline">Completar</span>
                </button>
              </>
            )}
            {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
              <button
                onClick={() => onAction({ type: "cancel", appointment: appt })}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-destructive/20 text-destructive text-xs font-sans hover:bg-destructive/8 transition-colors"
                title="Cancelar turno"
              >
                <XCircle size={12} aria-hidden />
                <span className="hidden sm:inline">Cancelar</span>
              </button>
            )}
            {appt.status === "CANCELLED" && (
              <button
                onClick={() => onAction({ type: "delete", appointment: appt })}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-destructive/20 text-destructive text-xs font-sans hover:bg-destructive/8 transition-colors"
                title="Eliminar turno cancelado"
              >
                <Trash2 size={12} aria-hidden />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Fila expandida de servicios */}
      {expanded && (
        <tr className="bg-arya-cream-light/80 border-b border-arya-gold/10">
          <td colSpan={6} className="px-8 py-3">
            <ul className="flex flex-col gap-1">
              {appt.items.map((item) => (
                <li key={item.id} className="flex justify-between items-center text-xs font-sans text-arya-text-muted">
                  <span>{item.service.name}</span>
                  <span>{formatPrice(item.finalPrice ?? item.priceAtBooking)}</span>
                </li>
              ))}
            </ul>
            {appt.notes && (
              <p className="mt-2 text-xs font-sans text-arya-text-muted/70 italic border-t border-arya-gold/10 pt-2">
                Nota: {appt.notes}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function TurnosClient({ appointments: initial }: { appointments: Appointment[] }) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modal, setModal] = useState<Modal>(null);
  const [, startTransition] = useTransition();

  // Filtros
  const filtered = useMemo(() => {
    let list = appointments;

    if (statusFilter !== "ALL") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => {
        const name = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
        const wa = a.client.whatsapp.toLowerCase();
        const services = a.items.map((i) => i.service.name.toLowerCase()).join(" ");
        return name.includes(q) || wa.includes(q) || services.includes(q);
      });
    }

    return list;
  }, [appointments, query, statusFilter]);

  const handleSuccess = () => {
    setModal(null);
    startTransition(() => {
      router.refresh();
    });
  };

  // Contar por estado para los badges de filtro
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: appointments.length };
    for (const a of appointments) {
      c[a.status] = (c[a.status] ?? 0) + 1;
    }
    return c;
  }, [appointments]);

  return (
    <div className="flex flex-col gap-5">

      {/* Filtros + búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-arya-text-muted/50 pointer-events-none" aria-hidden />
          <input
            type="search"
            placeholder="Buscar por nombre, WhatsApp o servicio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream-light text-arya-text placeholder:text-arya-text-muted/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30"
            aria-label="Buscar turnos"
          />
        </div>

        {/* Filtro de estado */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                "px-3 py-2 rounded-lg border text-xs font-sans transition-colors",
                statusFilter === key
                  ? "bg-arya-green-dark text-arya-cream border-arya-green-dark"
                  : "border-arya-gold/25 text-arya-text-muted hover:border-arya-gold/50 hover:bg-arya-cream-light"
              )}
            >
              {label}
              {counts[key] != null && (
                <span className={cn("ml-1.5 font-medium", statusFilter === key ? "text-arya-cream/70" : "text-arya-text-muted/60")}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-arya-gold/20 rounded-xl bg-arya-cream-light">
          <CalendarDays size={36} className="mx-auto text-arya-gold/30 mb-3" aria-hidden />
          <p className="font-sans text-sm text-arya-text-muted">
            {appointments.length === 0
              ? "Todavía no hay turnos registrados."
              : "No hay turnos que coincidan con los filtros."}
          </p>
          {query && (
            <button onClick={() => setQuery("")} className="mt-2 text-xs font-sans text-arya-green-dark underline underline-offset-4">
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="border border-arya-gold/20 rounded-xl overflow-hidden bg-arya-cream">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-arya-gold/15 bg-arya-cream-light">
                  <th className="px-4 py-3 font-sans text-xs text-arya-text-muted uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 font-sans text-xs text-arya-text-muted uppercase tracking-wider hidden sm:table-cell">Servicios</th>
                  <th className="px-4 py-3 font-sans text-xs text-arya-text-muted uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 font-sans text-xs text-arya-text-muted uppercase tracking-wider hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3 font-sans text-xs text-arya-text-muted uppercase tracking-wider hidden lg:table-cell text-right">Total</th>
                  <th className="px-4 py-3 font-sans text-xs text-arya-text-muted uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appt={appt}
                    onAction={setModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-arya-gold/10 bg-arya-cream-light">
            <p className="font-sans text-xs text-arya-text-muted">
              {filtered.length} turno{filtered.length !== 1 ? "s" : ""}
              {statusFilter !== "ALL" || query ? " (filtrados)" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Modales */}
      {modal?.type === "confirm" && (
        <ConfirmModal
          appointment={modal.appointment}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      {modal?.type === "complete" && (
        <CompleteModal
          appointment={modal.appointment}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      {modal?.type === "cancel" && (
        <CancelModal
          appointmentId={modal.appointment.id}
          clientName={`${modal.appointment.client.firstName} ${modal.appointment.client.lastName}`}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteCancelledModal
          appointment={modal.appointment}
          onClose={() => setModal(null)}
          onDeleted={(id) => {
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Modal confirmación de eliminación ───────────────────────────────────────

function DeleteCancelledModal({
  appointment,
  onClose,
  onDeleted,
}: {
  appointment: Appointment;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const clientName = `${appointment.client.firstName} ${appointment.client.lastName}`;

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al eliminar.");
        return;
      }
      onDeleted(appointment.id);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-arya-cream rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-arya-gold/20 bg-arya-cream-light flex items-center justify-between">
          <h2 className="font-heading text-lg font-light text-arya-green-dark">Eliminar turno</h2>
          <button onClick={onClose} className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors">
            <XCircle size={16} />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="font-sans text-sm text-arya-text">
            ¿Eliminar el turno cancelado de <strong>{clientName}</strong>? Esta acción no se puede deshacer.
          </p>
          {error && <p className="font-sans text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-sm hover:bg-arya-gold/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive text-white font-sans text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
