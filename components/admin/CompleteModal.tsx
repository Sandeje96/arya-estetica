"use client";

import { useState, useTransition } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  priceAtBooking: number;
  finalPrice?: number | null;
  service: { name: string };
}

interface Appointment {
  id: string;
  client: { firstName: string; lastName: string };
  items: Item[];
  totalEstimated: number;
}

interface CompleteModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompleteModal({ appointment, onClose, onSuccess }: CompleteModalProps) {
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(
      appointment.items.map((i) => [
        i.id,
        String(i.finalPrice ?? i.priceAtBooking),
      ])
    )
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = Object.values(prices).reduce(
    (sum, v) => sum + (parseInt(v) || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const items = appointment.items.map((i) => ({
      id: i.id,
      finalPrice: parseInt(prices[i.id]) || 0,
    }));

    if (items.some((i) => i.finalPrice < 0)) {
      setError("Los precios no pueden ser negativos.");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", items, totalCharged: total }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al completar el turno.");
        return;
      }

      onSuccess();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-arya-cream rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92svh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-arya-gold/20 bg-arya-cream-light">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" aria-hidden />
            <h2 className="font-heading text-lg font-light text-arya-green-dark">Completar turno</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors" aria-label="Cerrar">
            <X size={16} aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4 overflow-y-auto">
          <p className="font-sans text-sm text-arya-text-muted">
            Revisá y ajustá los precios finales cobrados a{" "}
            <strong className="text-arya-text">{appointment.client.firstName} {appointment.client.lastName}</strong>.
          </p>

          {/* Items con precios editables */}
          <div className="border border-arya-gold/20 rounded-lg overflow-hidden">
            {appointment.items.map((item, i) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i > 0 && "border-t border-arya-gold/10"
                )}
              >
                <span className="flex-1 font-sans text-sm text-arya-text leading-snug">
                  {item.service.name}
                </span>
                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-xs text-arya-text-muted pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={prices[item.id]}
                    onChange={(e) =>
                      setPrices((p) => ({ ...p, [item.id]: e.target.value }))
                    }
                    className="w-full pl-6 pr-2 py-1.5 rounded-md border border-arya-gold/25 bg-arya-cream-light font-sans text-sm text-right focus:outline-none focus:ring-2 focus:ring-arya-green/30 transition-colors"
                    aria-label={`Precio final de ${item.service.name}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-1">
            <span className="font-sans text-sm text-arya-text-muted">Total a cobrar</span>
            <span className="font-heading text-2xl font-light text-arya-green-dark">
              {formatPrice(total)}
            </span>
          </div>

          {total !== appointment.totalEstimated && (
            <p className="font-sans text-xs text-arya-text-muted/60 -mt-2">
              Estimado original: {formatPrice(appointment.totalEstimated)}
            </p>
          )}

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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-700 text-white font-sans text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
              Marcar completado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
