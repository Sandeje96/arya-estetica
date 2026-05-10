"use client";

import { useState, useTransition } from "react";
import { X, CalendarDays, Loader2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  scheduledAt?: string | null;
  client: { firstName: string; lastName: string; whatsapp: string };
  items: { service: { name: string } }[];
}

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export function RescheduleModal({ appointment, onClose, onSuccess }: RescheduleModalProps) {
  // Pre-fill con la fecha actual del turno (si existe)
  const initialValue = appointment.scheduledAt
    ? format(new Date(appointment.scheduledAt), "yyyy-MM-dd'T'HH:mm")
    : "";

  const [scheduledAt, setScheduledAt] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) { setError("Seleccioná la nueva fecha y hora."); return; }
    setError(null);

    startTransition(async () => {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", scheduledAt: new Date(scheduledAt).toISOString() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al reprogramar.");
        return;
      }
      setDone(true);
      onSuccess();
    });
  };

  const waMessage = scheduledAt
    ? `Hola ${appointment.client.firstName}! 🌿 Te avisamos que tu turno en Arya Estética fue reprogramado para el ${format(new Date(scheduledAt), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })} hs. ¡Cualquier consulta escribinos! 💚`
    : "";
  const waLink = waMessage ? buildWhatsappLink(appointment.client.whatsapp, waMessage) : "#";

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
            <h2 className="font-heading text-lg font-light text-arya-green-dark">Reprogramar turno</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors" aria-label="Cerrar">
            <X size={16} aria-hidden />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-6 flex flex-col gap-4 overflow-y-auto">
            <p className="font-sans text-sm text-arya-text">
              ✅ Turno reprogramado. Usá el botón para avisarle a <strong>{appointment.client.firstName}</strong>:
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors"
            >
              <MessageCircle size={15} aria-hidden />
              Avisar cambio por WhatsApp
            </a>
            <button onClick={onClose} className="text-sm font-sans text-arya-text-muted underline underline-offset-4 hover:text-arya-text transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4 overflow-y-auto">
            {/* Resumen */}
            <div className="rounded-lg bg-arya-cream-light border border-arya-gold/20 px-4 py-3 text-sm font-sans">
              <p className="font-medium text-arya-text">
                {appointment.client.firstName} {appointment.client.lastName}
              </p>
              <p className="text-arya-text-muted text-xs mt-0.5">
                {appointment.items.map((i) => i.service.name).join(" · ")}
              </p>
              {appointment.scheduledAt && (
                <p className="text-arya-text-muted/60 text-xs mt-1">
                  Fecha actual: {format(new Date(appointment.scheduledAt), "EEEE d MMM yyyy HH:mm", { locale: es })} hs
                </p>
              )}
            </div>

            {/* Nueva fecha */}
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Nueva fecha y hora *</span>
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
                Guardar nueva fecha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
