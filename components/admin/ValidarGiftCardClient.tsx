"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Gift,
  User,
  Phone,
  Heart,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { formatPrice } from "@/lib/formatting";
import { cn } from "@/lib/utils";

type GiftCardStatus = "PENDING_PICKUP" | "READY" | "REDEEMED" | "CANCELLED";

interface GiftCardData {
  code:          string;
  recipientName: string;
  buyerName:     string;
  buyerWhatsapp: string;
  totalAmount:   number;
  status:        GiftCardStatus;
  createdAt:     string;
  redeemedAt:    string | null;
  services:      Array<{ name: string; price: number }>;
}

const STATUS_CONFIG: Record<
  GiftCardStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING_PICKUP: {
    label: "Pendiente de retiro",
    color: "text-amber-700",
    bg:    "bg-amber-50 border-amber-200",
    icon:  Clock,
  },
  READY: {
    label: "Lista para usar",
    color: "text-arya-green-dark",
    bg:    "bg-emerald-50 border-emerald-200",
    icon:  CheckCircle2,
  },
  REDEEMED: {
    label: "Utilizada",
    color: "text-arya-text-muted",
    bg:    "bg-gray-50 border-gray-200",
    icon:  CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelada",
    color: "text-destructive",
    bg:    "bg-destructive/5 border-destructive/20",
    icon:  XCircle,
  },
};

interface Props {
  data: GiftCardData;
}

export function ValidarGiftCardClient({ data: initial }: Props) {
  const [data, setData]     = useState(initial);
  const [error, setError]   = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cfg    = STATUS_CONFIG[data.status];
  const Icon   = cfg.icon;
  const isUsable = data.status === "READY";

  const handleRedeem = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/gift-cards/${data.code}/redeem`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error al canjear la gift card");
        return;
      }
      setData((prev) => ({
        ...prev,
        status:     "REDEEMED",
        redeemedAt: json.redeemedAt
          ? new Date(json.redeemedAt).toLocaleDateString("es-AR", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })
          : null,
      }));
    });
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Badge de estado */}
      <div className={cn("flex items-center gap-3 p-4 rounded-xl border", cfg.bg)}>
        <Icon size={22} className={cfg.color} aria-hidden />
        <div>
          <p className={cn("font-sans text-sm font-semibold", cfg.color)}>{cfg.label}</p>
          {data.status === "REDEEMED" && data.redeemedAt && (
            <p className="font-sans text-xs text-arya-text-muted">
              Canjeada el {data.redeemedAt}
            </p>
          )}
          {data.status === "PENDING_PICKUP" && (
            <p className="font-sans text-xs text-arya-text-muted">
              Cambiar a "Lista" desde la lista de gift cards antes de canjear.
            </p>
          )}
        </div>
      </div>

      {/* Datos de la tarjeta */}
      <div className="rounded-xl border border-arya-gold/20 bg-arya-cream-light divide-y divide-arya-gold/10">

        <div className="flex items-center gap-3 px-4 py-3">
          <Heart size={15} className="text-arya-gold shrink-0" aria-hidden />
          <div>
            <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider">Para</p>
            <p className="font-sans text-sm font-medium text-arya-text">{data.recipientName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <User size={15} className="text-arya-text-muted/60 shrink-0" aria-hidden />
          <div>
            <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider">Comprador/a</p>
            <p className="font-sans text-sm text-arya-text">{data.buyerName}</p>
            <p className="font-sans text-xs text-arya-text-muted">{data.buyerWhatsapp}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <Gift size={15} className="text-arya-gold shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider mb-1">Servicios incluidos</p>
            <ul className="flex flex-col gap-1">
              {data.services.map((srv, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span className="font-sans text-xs text-arya-text">{srv.name}</span>
                  <span className="font-sans text-xs text-arya-text-muted">{formatPrice(srv.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-4 py-3 flex justify-between items-center">
          <span className="font-sans text-xs text-arya-text-muted">Total</span>
          <span className="font-heading text-xl font-light text-arya-green-dark">
            {formatPrice(data.totalAmount)}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive font-sans text-sm" role="alert">
          <AlertTriangle size={15} className="shrink-0" aria-hidden />
          {error}
        </div>
      )}

      {/* Botón de canje */}
      {isUsable && (
        <button
          onClick={handleRedeem}
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors disabled:opacity-60 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Canjeando…
            </>
          ) : (
            <>
              <CheckCircle2 size={16} aria-hidden />
              Marcar como utilizada
            </>
          )}
        </button>
      )}

      {data.status === "REDEEMED" && (
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans text-sm">
          <CheckCircle2 size={16} aria-hidden />
          Gift card canjeada exitosamente
        </div>
      )}
    </div>
  );
}
