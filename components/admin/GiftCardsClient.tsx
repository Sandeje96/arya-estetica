"use client";

import { useState, useTransition } from "react";
import {
  Gift,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";
import { formatPrice } from "@/lib/formatting";
import { cn } from "@/lib/utils";

type GiftCardStatus = "PENDING_PICKUP" | "READY" | "REDEEMED" | "CANCELLED";

export interface GiftCardRow {
  id:            string;
  code:          string;
  recipientName: string;
  buyerName:     string;
  totalAmount:   number;
  status:        GiftCardStatus;
  createdAt:     string;
  serviceCount:  number;
}

interface Props {
  giftCards: GiftCardRow[];
}

const STATUS_CONFIG: Record<
  GiftCardStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  PENDING_PICKUP: {
    label:  "Pendiente",
    color:  "text-amber-700",
    bg:     "bg-amber-50",
    border: "border-amber-200",
    icon:   Clock,
  },
  READY: {
    label:  "Lista",
    color:  "text-arya-green-dark",
    bg:     "bg-emerald-50",
    border: "border-emerald-200",
    icon:   CheckCircle2,
  },
  REDEEMED: {
    label:  "Utilizada",
    color:  "text-arya-text-muted",
    bg:     "bg-gray-50",
    border: "border-gray-200",
    icon:   CheckCircle2,
  },
  CANCELLED: {
    label:  "Cancelada",
    color:  "text-destructive",
    bg:     "bg-destructive/5",
    border: "border-destructive/20",
    icon:   XCircle,
  },
};

const ALL_STATUSES: GiftCardStatus[] = ["PENDING_PICKUP", "READY", "REDEEMED", "CANCELLED"];

function StatusBadge({ status }: { status: GiftCardStatus }) {
  const cfg  = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-sans font-medium",
      cfg.color, cfg.bg, cfg.border
    )}>
      <Icon size={10} aria-hidden />
      {cfg.label}
    </span>
  );
}

function MarkReadyButton({ code, onReady }: { code: string; onReady: (code: string) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const res = await fetch(`/api/gift-cards/${code}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "READY" }),
      });
      if (res.ok) onReady(code);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-arya-green-soft/40 text-arya-green-dark bg-arya-green/5 hover:bg-arya-green/10 transition-colors text-xs font-sans disabled:opacity-60 whitespace-nowrap"
    >
      {isPending ? <Loader2 size={11} className="animate-spin" aria-hidden /> : <CheckCircle2 size={11} aria-hidden />}
      Marcar lista
    </button>
  );
}

export function GiftCardsClient({ giftCards: initial }: Props) {
  const [cards, setCards]         = useState(initial);
  const [search, setSearch]       = useState("");
  const [statusFilter, setFilter] = useState<GiftCardStatus | "ALL">("ALL");
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleReady = (code: string) => {
    setCards((prev) =>
      prev.map((c) => (c.code === code ? { ...c, status: "READY" as const } : c))
    );
  };

  const handleDelete = (card: GiftCardRow) => {
    if (!confirm(`¿Eliminar la gift card para "${card.recipientName}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(card.id);
    startTransition(async () => {
      const res = await fetch(`/api/gift-cards/${card.code}`, { method: "DELETE" });
      if (res.ok) setCards((prev) => prev.filter((c) => c.id !== card.id));
      setDeletingId(null);
    });
  };

  const normalize = (str: string) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtered = cards.filter((c) => {
    const matchSearch =
      !search ||
      normalize(c.recipientName).includes(normalize(search)) ||
      normalize(c.buyerName).includes(normalize(search)) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const countByStatus = (s: GiftCardStatus) => cards.filter((c) => c.status === s).length;

  return (
    <div className="flex flex-col gap-4">

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-arya-text-muted/50" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm text-arya-text placeholder:text-arya-text-muted/40 focus:outline-none focus:ring-2 focus:ring-arya-green/30"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-3 py-2 rounded-lg border font-sans text-xs transition-colors",
              statusFilter === "ALL"
                ? "bg-arya-green-dark text-arya-cream border-arya-green-dark"
                : "border-arya-gold/30 text-arya-text-muted hover:border-arya-gold/60"
            )}
          >
            Todas ({cards.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-2 rounded-lg border font-sans text-xs transition-colors",
                  statusFilter === s
                    ? "bg-arya-green-dark text-arya-cream border-arya-green-dark"
                    : "border-arya-gold/30 text-arya-text-muted hover:border-arya-gold/60"
                )}
              >
                {cfg.label} ({countByStatus(s)})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex items-center gap-3 px-4 py-5 rounded-xl border border-arya-gold/20 bg-arya-cream-light text-arya-text-muted">
          <Gift size={16} className="text-arya-gold shrink-0" aria-hidden />
          <p className="font-sans text-sm">No hay gift cards con ese filtro.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-arya-gold/20 bg-arya-cream-light overflow-hidden">
          <div className="divide-y divide-arya-gold/10">
            {filtered.map((card) => (
              <div
                key={card.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4"
              >
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-sans text-sm font-medium text-arya-text">
                      Para: {card.recipientName}
                    </span>
                    <StatusBadge status={card.status} />
                  </div>
                  <p className="font-sans text-xs text-arya-text-muted">
                    Comprador/a: {card.buyerName} ·{" "}
                    {card.serviceCount} servicio{card.serviceCount !== 1 ? "s" : ""} ·{" "}
                    {formatPrice(card.totalAmount)}
                  </p>
                  <p className="font-sans text-[10px] text-arya-text-muted/60 mt-0.5 font-mono">
                    {card.code} · {card.createdAt}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0">
                  {card.status === "PENDING_PICKUP" && (
                    <MarkReadyButton code={card.code} onReady={handleReady} />
                  )}

                  {/* Descargar PDF */}
                  <a
                    href={`/api/gift-cards/${card.code}/pdf`}
                    download
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-arya-gold/40 text-arya-green-dark hover:bg-arya-gold/10 transition-colors text-xs font-sans whitespace-nowrap"
                  >
                    <Download size={11} aria-hidden />
                    PDF
                  </a>

                  {/* Abrir validación */}
                  <a
                    href={`/admin/gift-cards/validar/${card.code}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-arya-gold/40 text-arya-green-dark hover:bg-arya-gold/10 transition-colors text-xs font-sans whitespace-nowrap"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={11} aria-hidden />
                    Ver
                  </a>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(card)}
                    disabled={deletingId === card.id}
                    className="p-1.5 rounded-lg border border-arya-gold/30 text-arya-text-muted hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
                    title="Eliminar gift card"
                  >
                    {deletingId === card.id
                      ? <Loader2 size={13} className="animate-spin" aria-hidden />
                      : <Trash2 size={13} aria-hidden />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
