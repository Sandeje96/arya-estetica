"use client";

import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  description?: string | null;
  imageUrl?: string | null;
}

export function ServiceCard({
  id,
  name,
  category,
  basePrice,
  description,
  imageUrl,
}: ServiceCardProps) {
  const { add, remove, has } = useCart();
  const inCart = has(id);

  const toggle = () => {
    if (inCart) {
      remove(id);
    } else {
      add({ id, name, category, price: basePrice });
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
          <button
            onClick={toggle}
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
              <>
                <Check size={13} aria-hidden />
                Agregado
              </>
            ) : (
              <>
                <Plus size={13} aria-hidden />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
