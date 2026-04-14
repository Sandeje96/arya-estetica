"use client";

import Image from "next/image";
import { Plus, Check, Minus } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id:          string;
  name:        string;
  category:    string;
  basePrice:   number;
  description?: string | null;
  imageUrl?:   string | null;
  maxQty?:     number;   // si > 1, permite agregar varias veces
}

export function ServiceCard({
  id,
  name,
  category,
  basePrice,
  description,
  imageUrl,
  maxQty = 1,
}: ServiceCardProps) {
  const { add, remove, has, countOf, items } = useCart();

  const qty    = countOf(id);
  const inCart = qty > 0;
  const multi  = maxQty > 1;

  const handleAdd = () => {
    if (qty >= maxQty) return;
    // ID único por instancia: serviceId para la primera, serviceId_N para las siguientes
    const instanceId = qty === 0 ? id : `${id}_${qty + 1}`;
    add({ id: instanceId, serviceId: id, name, category, price: basePrice });
  };

  const handleRemove = () => {
    if (qty === 0) return;
    // Eliminar la última instancia agregada
    const instances = items.filter((i) => i.serviceId === id);
    const last = instances[instances.length - 1];
    if (last) remove(last.id);
  };

  // Para servicios normales (maxQty=1), toggle
  const handleToggle = () => {
    if (inCart) {
      const inst = items.find((i) => i.serviceId === id);
      if (inst) remove(inst.id);
    } else {
      add({ id, serviceId: id, name, category, price: basePrice });
    }
  };

  return (
    <article
      className={cn(
        "group flex flex-col rounded-lg border bg-arya-cream transition-all duration-150",
        inCart
          ? "border-arya-green shadow-sm shadow-arya-green/10"
          : "border-arya-gold/25 hover:border-arya-gold/60 hover:shadow-sm hover:-translate-y-0.5"
      )}
    >
      {/* Imagen */}
      {imageUrl && (
        <div className="relative h-40 rounded-t-lg overflow-hidden bg-arya-cream-light">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-heading text-lg font-light text-arya-green-dark leading-snug">
          {name}
        </h3>
        {description && (
          <p className="font-sans text-xs text-arya-text-muted leading-relaxed">
            {description}
          </p>
        )}

        {/* Precio + botón */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-arya-gold/15">
          <span className="font-heading text-xl font-light text-arya-text">
            {formatPrice(basePrice)}
          </span>

          {multi ? (
            /* Controles de cantidad */
            <div className="flex items-center gap-1">
              {qty > 0 && (
                <button
                  onClick={handleRemove}
                  aria-label={`Quitar una unidad de ${name}`}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-arya-green-dark text-arya-cream hover:bg-arya-green transition-colors"
                >
                  <Minus size={12} aria-hidden />
                </button>
              )}
              {qty > 0 && (
                <span className="font-sans text-sm font-medium text-arya-green-dark min-w-[1.5rem] text-center">
                  {qty}
                </span>
              )}
              <button
                onClick={handleAdd}
                disabled={qty >= maxQty}
                aria-label={`Agregar ${name} al carrito`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all",
                  qty >= maxQty
                    ? "bg-arya-green/40 text-arya-cream cursor-not-allowed"
                    : qty > 0
                      ? "bg-arya-green text-arya-cream hover:bg-arya-green-soft"
                      : "bg-arya-green-dark text-arya-cream hover:bg-arya-green"
                )}
              >
                <Plus size={13} aria-hidden />
                {qty === 0 ? "Agregar" : qty >= maxQty ? `Máx. ${maxQty}` : "Agregar"}
              </button>
            </div>
          ) : (
            /* Botón toggle normal */
            <button
              onClick={handleToggle}
              aria-pressed={inCart}
              aria-label={inCart ? `Quitar ${name} del carrito` : `Agregar ${name} al carrito`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all",
                inCart
                  ? "bg-arya-green text-arya-cream hover:bg-arya-green-soft"
                  : "bg-arya-green-dark text-arya-cream hover:bg-arya-green"
              )}
            >
              {inCart ? (
                <><Check size={13} aria-hidden />Agregado</>
              ) : (
                <><Plus size={13} aria-hidden />Agregar</>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
