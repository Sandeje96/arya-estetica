"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, X, ChevronUp, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/formatting";
import { cn } from "@/lib/utils";

// ─── Cart interior (lista de items) ──────────────────────────────────────────

function CartContent({ onClose }: { onClose?: () => void }) {
  const { items, total, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
        <ShoppingBag size={36} className="text-arya-gold/40" aria-hidden />
        <p className="font-sans text-sm text-arya-text-muted">
          Todavía no agregaste ningún servicio.
        </p>
        <p className="font-sans text-xs text-arya-text-muted/60">
          Hacé click en "+ Agregar" para sumar servicios a tu turno.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Lista */}
      <ul className="flex-1 overflow-y-auto divide-y divide-arya-gold/10 px-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 py-3">
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-arya-text font-medium leading-snug">
                {item.name}
              </p>
              <p className="font-sans text-xs text-arya-text-muted mt-0.5">
                {formatPrice(item.price)}
              </p>
            </div>
            <button
              onClick={() => remove(item.id)}
              className="shrink-0 p-1 rounded text-arya-text-muted/60 hover:text-arya-green-dark hover:bg-arya-gold/10 transition-colors"
              aria-label={`Quitar ${item.name}`}
            >
              <X size={14} aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {/* Footer: total + acciones */}
      <div className="border-t border-arya-gold/20 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-3 bg-arya-cream-light">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm text-arya-text-muted">Subtotal estimado</span>
          <span className="font-heading text-xl font-light text-arya-green-dark">
            {formatPrice(total)}
          </span>
        </div>
        <p className="font-sans text-[10px] text-arya-text-muted/50 -mt-1">
          El precio final lo confirma la admin al completar el turno.
        </p>

        {/* Botón agendar */}
        <Link
          href="/reservar"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-arya-green-dark text-arya-cream-light font-sans text-sm font-medium tracking-wide hover:bg-arya-green transition-colors shadow-sm"
        >
          Agendar turno
          <ArrowRight size={15} aria-hidden />
        </Link>

        {/* Vaciar */}
        <button
          onClick={clear}
          className="flex items-center justify-center gap-1.5 w-full py-1.5 text-arya-text-muted/50 hover:text-arya-text-muted text-xs font-sans transition-colors"
          aria-label="Vaciar carrito"
        >
          <Trash2 size={12} aria-hidden />
          Vaciar carrito
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar desktop ──────────────────────────────────────────────────────────

export function CartSidebar() {
  const { count } = useCart();

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0">
      <div className="sticky top-20 flex flex-col bg-arya-cream border border-arya-gold/30 rounded-xl overflow-hidden shadow-sm max-h-[calc(100svh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-arya-gold/20 bg-arya-cream-light">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-arya-green-dark" aria-hidden />
            <span className="font-heading text-lg font-light text-arya-green-dark">
              Tu selección
            </span>
          </div>
          {count > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-arya-green-dark text-arya-cream text-[10px] font-sans font-medium">
              {count}
            </span>
          )}
        </div>
        <CartContent />
      </div>
    </aside>
  );
}

// ─── Bottom bar mobile ────────────────────────────────────────────────────────

export function CartMobile() {
  const { count, total } = useCart();
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex flex-col bg-arya-cream rounded-t-2xl shadow-2xl transition-transform duration-300"
        style={{
          maxHeight: open ? "80svh" : undefined,
          transform: open
            ? "translateY(0)"
            : "translateY(calc(100% - 4rem - env(safe-area-inset-bottom, 0px)))",
        }}
      >
        {/* Handle / toggle bar */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between px-5 py-3 h-16 border-b border-arya-gold/20"
          style={!open ? { paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" } : undefined}
          aria-label={open ? "Cerrar carrito" : "Ver carrito"}
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag size={20} className="text-arya-green-dark" aria-hidden />
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-arya-green-dark text-arya-cream text-[9px] font-sans font-medium">
                {count}
              </span>
            </div>
            <span className="font-sans text-sm font-medium text-arya-green-dark">
              Tu selección · {formatPrice(total)}
            </span>
          </div>
          <ChevronUp
            size={18}
            className={cn(
              "text-arya-text-muted transition-transform duration-200",
              open ? "rotate-180" : "rotate-0"
            )}
            aria-hidden
          />
        </button>

        {/* Contenido (solo visible cuando abierto) */}
        {open && (
          <div className="flex flex-col overflow-hidden flex-1">
            <CartContent onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}
