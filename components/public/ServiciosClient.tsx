"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import { CartSidebar, CartMobile } from "./Cart";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  description?: string | null;
  imageUrl?: string | null;
  isLaser: boolean;
}

interface ServiciosClientProps {
  services: Service[];
  hasActiveLaserDay: boolean;
}

export function ServiciosClient({ services, hasActiveLaserDay }: ServiciosClientProps) {
  const [query, setQuery] = useState("");

  // Filtrar por búsqueda
  const filtered = useMemo(() => {
    if (!query.trim()) return services;
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return services.filter((s) => {
      const name = s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cat = (CATEGORY_LABELS[s.category] ?? s.category)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || cat.includes(q);
    });
  }, [services, query]);

  // Agrupar por categoría respetando el orden
  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter(
        (s) =>
          s.category === cat &&
          // Ocultar depilación láser si no hay jornada activa
          (cat !== "depilacion" || hasActiveLaserDay)
      );
      if (items.length > 0) map.set(cat, items);
    }
    // Categorías no contempladas en CATEGORY_ORDER (por si hubiera nuevas)
    for (const svc of filtered) {
      if (!CATEGORY_ORDER.includes(svc.category) && !map.has(svc.category)) {
        map.set(svc.category, filtered.filter((s) => s.category === svc.category));
      }
    }
    return map;
  }, [filtered, hasActiveLaserDay]);

  const totalVisible = [...grouped.values()].reduce((n, arr) => n + arr.length, 0);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Columna principal ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-10">

          {/* Buscador */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-arya-text-muted/50 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar servicios…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream-light text-arya-text placeholder:text-arya-text-muted/50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/40 focus:border-arya-green-soft"
              aria-label="Buscar servicios"
            />
          </div>

          {/* Sin resultados */}
          {totalVisible === 0 && (
            <div className="py-16 text-center">
              <p className="font-sans text-arya-text-muted">
                No se encontraron servicios para <strong>"{query}"</strong>.
              </p>
              <button
                onClick={() => setQuery("")}
                className="mt-3 text-sm text-arya-green-dark underline underline-offset-4 font-sans"
              >
                Ver todos
              </button>
            </div>
          )}

          {/* Categorías */}
          {[...grouped.entries()].map(([cat, items]) => (
            <section key={cat} id={cat} className="scroll-mt-20">
              {/* Título de categoría */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-heading text-2xl sm:text-3xl font-light text-arya-green-dark">
                  {CATEGORY_LABELS[cat] ?? cat}
                </h2>
                {cat === "depilacion" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-arya-gold/15 text-arya-gold text-[10px] font-sans font-medium uppercase tracking-wider">
                    Jornada mensual
                  </span>
                )}
                <div className="flex-1 h-px bg-arya-gold/20" />
              </div>

              {/* Grid de servicios */}
              <div
                className={cn(
                  "grid gap-4",
                  "grid-cols-1 sm:grid-cols-2",
                  // Adicionales de uñas son chicas, van en 3 columnas en desktop
                  cat === "adicionales_unas" && "lg:grid-cols-3"
                )}
              >
                {items.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    id={svc.id}
                    name={svc.name}
                    category={svc.category}
                    basePrice={svc.basePrice}
                    description={svc.description}
                    imageUrl={svc.imageUrl}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Nota depilación láser si no hay jornada */}
          {!hasActiveLaserDay && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-arya-gold/30 bg-arya-cream-light">
              <span className="text-xl" aria-hidden>🔆</span>
              <div>
                <p className="font-sans text-sm font-medium text-arya-text">
                  Depilación láser — próximamente
                </p>
                <p className="font-sans text-xs text-arya-text-muted mt-0.5">
                  Los turnos de depilación Soprano Ice Titanium se abren cuando hay una jornada activa.
                  Seguinos en Instagram para enterarte primero.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar carrito desktop ───────────────────────────────────────── */}
        <CartSidebar />
      </div>

      {/* ── Bottom sheet carrito mobile ───────────────────────────────────── */}
      <CartMobile />
    </>
  );
}
