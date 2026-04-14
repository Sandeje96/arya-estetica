"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Check, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatting";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ServiceRow {
  id:          string;
  name:        string;
  category:    string;
  basePrice:   number;
  description: string | null;
  active:      boolean;
  isLaser:     boolean;
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export const CATEGORIES: Record<string, string> = {
  capilar:              "Tratamientos capilares",
  peinados:             "Peinados",
  cortes:               "Cortes",
  combos:               "Combos",
  manos:                "Manos",
  pies:                 "Pies",
  adicionales_unas:     "Adicionales de uñas",
  masoterapia:          "Masoterapia",
  cosmetologia:         "Cosmetología",
  maquillaje:           "Maquillaje",
  alisados:             "Alisados tradicionales",
  alisados_sin_quimicos:"Alisados sin químicos",
  depilacion:           "Depilación láser",
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

// ─── Modal crear / editar ─────────────────────────────────────────────────────

interface ModalProps {
  initial?: ServiceRow | null;
  onClose: () => void;
  onSaved: (svc: ServiceRow) => void;
}

function ServiceModal({ initial, onClose, onSaved }: ModalProps) {
  const isEdit = !!initial;
  const [name,        setName]        = useState(initial?.name        ?? "");
  const [category,    setCategory]    = useState(initial?.category    ?? CATEGORY_KEYS[0]);
  const [basePrice,   setBasePrice]   = useState(String(initial?.basePrice ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isLaser,     setIsLaser]     = useState(initial?.isLaser     ?? false);
  const [error,       setError]       = useState<string | null>(null);
  const [isPending,   startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(basePrice, 10);
    if (!name.trim())      { setError("El nombre es obligatorio."); return; }
    if (isNaN(price) || price < 0) { setError("El precio debe ser un número válido."); return; }
    setError(null);

    startTransition(async () => {
      const url    = isEdit ? `/api/services/${initial!.id}` : "/api/services";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category, basePrice: price, description: description.trim() || null, isLaser }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al guardar.");
        return;
      }
      const saved = await res.json();
      onSaved(saved);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-arya-cream rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92svh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-arya-gold/20 bg-arya-cream-light shrink-0">
          <h2 className="font-heading text-lg font-light text-arya-green-dark">
            {isEdit ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4 overflow-y-auto">
          {/* Nombre */}
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Nombre *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Botox capilar libre de formol"
              className="px-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream text-arya-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/40"
            />
          </label>

          {/* Categoría */}
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Categoría *</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream text-arya-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/40"
            >
              {CATEGORY_KEYS.map((k) => (
                <option key={k} value={k}>{CATEGORIES[k]}</option>
              ))}
            </select>
          </label>

          {/* Precio */}
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Precio base (ARS) *</span>
            <input
              type="number"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="25000"
              className="px-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream text-arya-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/40"
            />
          </label>

          {/* Descripción */}
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Descripción (opcional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Detalles adicionales del servicio…"
              className="px-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream text-arya-text font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-arya-green/40"
            />
          </label>

          {/* isLaser */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isLaser}
              onChange={(e) => setIsLaser(e.target.checked)}
              className="w-4 h-4 accent-arya-green-dark rounded"
            />
            <span className="font-sans text-sm text-arya-text">Solo disponible en jornadas de depilación láser</span>
          </label>

          {error && <p className="font-sans text-sm text-destructive" role="alert">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-sm hover:bg-arya-gold/10 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ServiciosAdminProps {
  initialServices: ServiceRow[];
}

export function ServiciosAdmin({ initialServices }: ServiciosAdminProps) {
  const [services,    setServices]    = useState<ServiceRow[]>(initialServices);
  const [modal,       setModal]       = useState<"new" | ServiceRow | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [togglingId,  setTogglingId]  = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Agrupar por categoría
  const grouped = CATEGORY_KEYS.reduce<Record<string, ServiceRow[]>>((acc, key) => {
    const rows = services.filter((s) => s.category === key);
    if (rows.length) acc[key] = rows;
    return acc;
  }, {});
  // Categorías custom (no definidas en CATEGORIES)
  const customCats = [...new Set(services.map((s) => s.category).filter((c) => !CATEGORIES[c]))];
  for (const c of customCats) {
    grouped[c] = services.filter((s) => s.category === c);
  }

  const handleToggleActive = (svc: ServiceRow) => {
    setTogglingId(svc.id);
    startTransition(async () => {
      const res = await fetch(`/api/services/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !svc.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setServices((prev) => prev.map((s) => s.id === svc.id ? updated : s));
      }
      setTogglingId(null);
    });
  };

  const handleDelete = (svc: ServiceRow) => {
    if (!confirm(`¿Eliminar "${svc.name}"? Si tiene turnos asociados se desactivará en lugar de borrarse.`)) return;
    setDeletingId(svc.id);
    startTransition(async () => {
      const res = await fetch(`/api/services/${svc.id}`, { method: "DELETE" });
      if (res.ok) {
        const d = await res.json();
        if (d.deactivated) {
          setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, active: false } : s));
        } else {
          setServices((prev) => prev.filter((s) => s.id !== svc.id));
        }
      }
      setDeletingId(null);
    });
  };

  const handleSaved = (saved: ServiceRow) => {
    setServices((prev) => {
      const exists = prev.find((s) => s.id === saved.id);
      return exists ? prev.map((s) => s.id === saved.id ? saved : s) : [...prev, saved];
    });
    setModal(null);
  };

  return (
    <>
      {/* Botón nuevo */}
      <div className="flex justify-end">
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nuevo servicio
        </button>
      </div>

      {/* Lista por categoría */}
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([catKey, rows]) => (
          <div key={catKey} className="rounded-xl border border-arya-gold/20 overflow-hidden bg-arya-cream">
            {/* Header categoría */}
            <div className="px-4 py-3 bg-arya-cream-light border-b border-arya-gold/20 flex items-center justify-between">
              <h3 className="font-heading text-base font-light text-arya-green-dark">
                {CATEGORIES[catKey] ?? catKey}
              </h3>
              <span className="font-sans text-xs text-arya-text-muted">
                {rows.length} servicio{rows.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Filas */}
            <div className="divide-y divide-arya-gold/10">
              {rows.map((svc) => (
                <div
                  key={svc.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    !svc.active && "opacity-50"
                  )}
                >
                  {/* Nombre + descripción */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-arya-text truncate">{svc.name}</p>
                    {svc.description && (
                      <p className="font-sans text-xs text-arya-text-muted truncate mt-0.5">{svc.description}</p>
                    )}
                  </div>

                  {/* Precio */}
                  <span className="font-sans text-sm font-medium text-arya-green-dark shrink-0 hidden sm:block">
                    {formatPrice(svc.basePrice)}
                  </span>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle activo */}
                    <button
                      onClick={() => handleToggleActive(svc)}
                      disabled={togglingId === svc.id}
                      className="p-1.5 rounded-lg hover:bg-arya-gold/10 transition-colors text-arya-text-muted"
                      title={svc.active ? "Desactivar" : "Activar"}
                    >
                      {togglingId === svc.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : svc.active
                          ? <ToggleRight size={18} className="text-arya-green" />
                          : <ToggleLeft size={18} />
                      }
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => setModal(svc)}
                      className="p-1.5 rounded-lg hover:bg-arya-gold/10 transition-colors text-arya-text-muted hover:text-arya-green-dark"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => handleDelete(svc)}
                      disabled={deletingId === svc.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-arya-text-muted hover:text-destructive"
                      title="Eliminar"
                    >
                      {deletingId === svc.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="text-center py-16 text-arya-text-muted font-sans text-sm">
            No hay servicios cargados.
          </div>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <ServiceModal
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
