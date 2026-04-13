"use client";

import { useTransition } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface CancelModalProps {
  appointmentId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelModal({
  appointmentId,
  clientName,
  onClose,
  onSuccess,
}: CancelModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (res.ok) onSuccess();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-arya-cream rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92svh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-arya-gold/20 bg-arya-cream-light">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={16} aria-hidden />
            <h2 className="font-heading text-lg font-light">Cancelar turno</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          <p className="font-sans text-sm text-arya-text leading-relaxed">
            ¿Estás segura que querés cancelar el turno de{" "}
            <strong>{clientName}</strong>? Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-sm hover:bg-arya-gold/10 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive text-white font-sans text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
              Sí, cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
