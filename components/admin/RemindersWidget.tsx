"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Bell, CheckCircle2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export interface PendingReminder {
  appointmentId:  string;
  clientName:     string;
  clientWhatsapp: string;
  scheduledAt:    string;
  reminderType:   "1day" | "hours";
}

interface RemindersWidgetProps {
  reminders: PendingReminder[];
}

function buildMessage(
  clientName: string,
  scheduledAt: string,
  type: "1day" | "hours"
): string {
  const date = new Date(scheduledAt);
  const firstName = clientName.split(" ")[0];

  if (type === "1day") {
    return (
      `¡Hola ${firstName}! 🌿 Te recordamos que mañana ` +
      `${format(date, "d 'de' MMMM", { locale: es })} a las ` +
      `${format(date, "HH:mm")} hs tenés turno en Arya Estética. ` +
      `Recordá: Edificio Puerta Real, Dpto 12 E, Villa Sarita. ¡Te esperamos! 💚`
    );
  }
  return (
    `¡Hola ${firstName}! 🌿 Te recordamos que hoy a las ` +
    `${format(date, "HH:mm")} hs tenés turno en Arya Estética. ` +
    `¡Ya falta poco! Te esperamos en Edificio Puerta Real, Dpto 12 E. 💚`
  );
}

interface ReminderItemProps {
  reminder: PendingReminder;
  onSent: (id: string, type: "1day" | "hours") => void;
}

function ReminderItem({ reminder, onSent }: ReminderItemProps) {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const message = buildMessage(
    reminder.clientName,
    reminder.scheduledAt,
    reminder.reminderType
  );
  const waLink = buildWhatsappLink(reminder.clientWhatsapp, message);

  const handleSend = () => {
    // Abre WhatsApp en una nueva pestaña
    window.open(waLink, "_blank", "noopener,noreferrer");

    // Marca como enviado en la DB
    startTransition(async () => {
      await fetch(`/api/reminders/${reminder.appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reminder.reminderType }),
      });
      setSent(true);
      onSent(reminder.appointmentId, reminder.reminderType);
    });
  };

  const scheduledDate = new Date(reminder.scheduledAt);
  const typeLabel = reminder.reminderType === "1day" ? "Mañana" : "Hoy";
  const timeStr   = format(scheduledDate, "HH:mm", { locale: es });
  const dateStr   = format(scheduledDate, "d MMM", { locale: es });

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border transition-all",
        sent
          ? "border-emerald-200 bg-emerald-50/50 opacity-60"
          : "border-arya-gold/30 bg-arya-cream-light hover:border-arya-gold/50"
      )}
    >
      {/* Icono */}
      <div
        className={cn(
          "mt-0.5 shrink-0 rounded-full p-1.5",
          reminder.reminderType === "1day"
            ? "bg-arya-gold/15 text-arya-gold"
            : "bg-arya-green/15 text-arya-green-dark"
        )}
      >
        <Bell size={14} aria-hidden />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans text-sm font-medium text-arya-text">
            {reminder.clientName}
          </span>
          <span
            className={cn(
              "text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full border",
              reminder.reminderType === "1day"
                ? "bg-arya-gold/10 text-amber-700 border-arya-gold/30"
                : "bg-arya-green/10 text-arya-green-dark border-arya-green-soft/30"
            )}
          >
            {typeLabel} {timeStr} hs · {dateStr}
          </span>
        </div>

        {/* Preview del mensaje */}
        <p className="font-sans text-xs text-arya-text-muted/70 mt-1 line-clamp-2 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Botón */}
      {sent ? (
        <div className="shrink-0 flex items-center gap-1 text-emerald-600 text-xs font-sans">
          <CheckCircle2 size={14} aria-hidden />
          Enviado
        </div>
      ) : (
        <button
          onClick={handleSend}
          disabled={isPending}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arya-green-dark text-arya-cream text-xs font-sans font-medium hover:bg-arya-green transition-colors disabled:opacity-60 whitespace-nowrap"
          title="Abrir WhatsApp con el mensaje pre-armado"
        >
          <MessageCircle size={12} aria-hidden />
          Enviar
          <ExternalLink size={10} className="opacity-60" aria-hidden />
        </button>
      )}
    </div>
  );
}

// ─── Widget principal ─────────────────────────────────────────────────────────

export function RemindersWidget({ reminders: initial }: RemindersWidgetProps) {
  const [reminders, setReminders] = useState(initial);

  const handleSent = (id: string, type: "1day" | "hours") => {
    // Quitar de la lista al marcar como enviado
    setReminders((prev) =>
      prev.filter(
        (r) => !(r.appointmentId === id && r.reminderType === type)
      )
    );
  };

  if (reminders.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-arya-gold/20 bg-arya-cream-light text-arya-text-muted">
        <CheckCircle2 size={16} className="text-arya-green shrink-0" aria-hidden />
        <p className="font-sans text-sm">
          No hay recordatorios pendientes por ahora.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-arya-gold" aria-hidden />
          <span className="font-sans text-sm font-medium text-arya-text">
            Recordatorios pendientes
          </span>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-arya-gold/20 text-amber-700 text-[10px] font-sans font-semibold">
            {reminders.length}
          </span>
        </div>
        <p className="font-sans text-[11px] text-arya-text-muted/60">
          Hacé click en "Enviar" para abrir WhatsApp
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {reminders.map((r) => (
          <ReminderItem
            key={`${r.appointmentId}-${r.reminderType}`}
            reminder={r}
            onSent={handleSent}
          />
        ))}
      </div>
    </div>
  );
}
