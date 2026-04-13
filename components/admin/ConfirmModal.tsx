"use client";

import { useState, useTransition } from "react";
import { X, CalendarDays, MessageCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  client: { firstName: string; lastName: string; whatsapp: string };
  items: { service: { name: string } }[];
  totalEstimated: number;
  notes?: string | null;
}

interface ConfirmModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: (updated: { scheduledAt: string }) => void;
}

export function ConfirmModal({ appointment, onClose, onSuccess }: ConfirmModalProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState(appointment.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) { setError("Seleccioná fecha y hora."); return; }
    setError(null);

    startTransition(async () => {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", scheduledAt, notes }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al confirmar.");
        return;
      }
      setConfirmed(true);
      onSuccess({ scheduledAt });
    });
  };

  const waMessage = scheduledAt
    ? `¡Hola ${appointment.client.firstName}! 🌿 Confirmamos tu turno en Arya Estética para el ${format(new Date(scheduledAt), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })} hs. Te esperamos en Edificio Puerta Real, Dpto 12 E, Villa Sarita. ¡Cualquier consulta escribinos! 💚`
    : "";
  const waLink = waMessage
    ? buildWhatsappLink(appointment.client.whatsapp, waMessage)
    : "#";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-arya-cream rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92svh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-arya-gold/20 bg-arya-cream-light">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-arya-green-dark" aria-hidden />
            <h2 className="font-heading text-lg font-light text-arya-green-dark">Confirmar turno</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors" aria-label="Cerrar">
            <X size={16} aria-hidden />
          </button>
        </div>

        {confirmed ? (
          <div className="px-5 py-6 flex flex-col gap-4 overflow-y-auto">
            <p className="font-sans text-sm text-arya-text">
              ✅ Turno confirmado. Usá el botón para avisarle a{" "}
              <strong>{appointment.client.firstName}</strong>:
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors"
            >
              <MessageCircle size={15} aria-hidden />
              Enviar confirmación por WhatsApp
            </a>
            <button onClick={onClose} className="text-sm font-sans text-arya-text-muted underline underline-offset-4 hover:text-arya-text transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4 overflow-y-auto">
            {/* Resumen del turno */}
            <div className="rounded-lg bg-arya-cream-light border border-arya-gold/20 px-4 py-3 text-sm font-sans">
              <p className="font-medium text-arya-text">
                {appointment.client.firstName} {appointment.client.lastName}
              </p>
              <p className="text-arya-text-muted text-xs mt-0.5">
                {appointment.items.map((i) => i.service.name).join(" · ")}
              </p>
            </div>

            {/* Fecha y hora */}
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Fecha y hora *</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className={cn(
                  "px-4 py-2.5 rounded-lg border bg-arya-cream text-arya-text font-sans text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-arya-green/40 transition-colors",
                  error && !scheduledAt ? "border-destructive" : "border-arya-gold/30"
                )}
              />
            </label>

            {/* Notas */}
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Notas internas</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ej: clienta nueva, alergia a X producto…"
                className="px-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream text-arya-text font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-arya-green/40 transition-colors"
              />
            </label>

            {error && <p className="font-sans text-sm text-destructive" role="alert">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-sm hover:bg-arya-gold/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                Confirmar turno
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
