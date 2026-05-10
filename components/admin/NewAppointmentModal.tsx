"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Plus, Trash2, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatting";
import { CATEGORY_LABELS } from "@/lib/categories";

interface Service {
  id:        string;
  name:      string;
  category:  string;
  basePrice: number;
  active:    boolean;
}

interface SelectedItem {
  serviceId: string;
  name:      string;
  price:     number;
}

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

export function NewAppointmentModal({ onClose, onSuccess }: Props) {
  // Cliente
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [whatsapp,   setWhatsapp]   = useState("");

  // Servicios
  const [services,   setServices]   = useState<Service[]>([]);
  const [query,      setQuery]      = useState("");
  const [selected,   setSelected]   = useState<SelectedItem[]>([]);

  // Turno
  const [scheduledAt, setScheduledAt] = useState("2026-05-07T09:00");
  const [notes,       setNotes]       = useState("");

  const [error,      setError]      = useState<string | null>(null);
  const [isPending,  startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data.filter((s: Service) => s.active) : []))
      .catch(() => {});
  }, []);

  const totalCharged = selected.reduce((s, i) => s + i.price, 0);

  const filteredServices = services.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[s.category as keyof typeof CATEGORY_LABELS] ?? s.category).toLowerCase().includes(q)
    );
  });

  const addService = (svc: Service) => {
    setSelected((prev) => [
      ...prev,
      { serviceId: svc.id, name: svc.name, price: svc.basePrice },
    ]);
  };

  const removeItem = (idx: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePrice = (idx: number, value: string) => {
    const n = parseInt(value.replace(/\D/g, ""), 10);
    setSelected((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, price: isNaN(n) ? 0 : n } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { setError("Ingresá nombre y apellido."); return; }
    if (!whatsapp.trim()) { setError("Ingresá el WhatsApp."); return; }
    if (selected.length === 0) { setError("Agregá al menos un servicio."); return; }
    if (!scheduledAt) { setError("Seleccioná la fecha y hora."); return; }
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/appointments/admin", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          client:      { firstName: firstName.trim(), lastName: lastName.trim(), whatsapp: whatsapp.trim() },
          items:       selected.map((i) => ({ serviceId: i.serviceId, price: i.price })),
          scheduledAt: new Date(scheduledAt).toISOString(),
          totalCharged,
          notes:       notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al guardar el turno.");
        return;
      }

      onSuccess();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-arya-cream rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[95svh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-arya-gold/20 bg-arya-cream-light shrink-0">
          <h2 className="font-heading text-lg font-light text-arya-green-dark">Nuevo turno</h2>
          <button onClick={onClose} className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors" aria-label="Cerrar">
            <X size={16} aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-5 overflow-y-auto">

          {/* ── Cliente ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="font-sans text-xs text-arya-text-muted uppercase tracking-wider mb-1">Clienta</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="font-sans text-xs text-arya-text-muted">Nombre *</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Lucía"
                  className="px-3 py-2 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-sans text-xs text-arya-text-muted">Apellido *</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="García"
                  className="px-3 py-2 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="font-sans text-xs text-arya-text-muted">WhatsApp *</span>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+5493764000000"
                className="px-3 py-2 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30"
              />
            </label>
          </fieldset>

          {/* ── Fecha ── */}
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Fecha y hora *</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="px-3 py-2 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30"
            />
          </label>

          {/* ── Servicios seleccionados ── */}
          {selected.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Servicios agregados</span>
              <ul className="flex flex-col gap-1.5">
                {selected.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-arya-cream-light border border-arya-gold/20">
                    <span className="flex-1 font-sans text-sm text-arya-text truncate">{item.name}</span>
                    <span className="font-sans text-xs text-arya-text-muted shrink-0">$</span>
                    <input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(e) => updatePrice(idx, e.target.value)}
                      className="w-24 px-2 py-1 rounded border border-arya-gold/30 bg-arya-cream font-sans text-sm text-right focus:outline-none focus:ring-1 focus:ring-arya-green/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={13} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center px-1">
                <span className="font-sans text-xs text-arya-text-muted">Total cobrado</span>
                <span className="font-heading text-base text-arya-green-dark">{formatPrice(totalCharged)}</span>
              </div>
            </div>
          )}

          {/* ── Buscador de servicios ── */}
          <div className="flex flex-col gap-2">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Agregar servicio</span>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-arya-text-muted/40 pointer-events-none" aria-hidden />
              <input
                type="search"
                placeholder="Buscar servicio…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30"
              />
            </div>
            <ul className="max-h-40 overflow-y-auto flex flex-col divide-y divide-arya-gold/10 rounded-lg border border-arya-gold/20 bg-arya-cream-light">
              {filteredServices.length === 0 ? (
                <li className="px-3 py-3 font-sans text-sm text-arya-text-muted text-center">Sin resultados</li>
              ) : (
                filteredServices.map((svc) => (
                  <li key={svc.id}>
                    <button
                      type="button"
                      onClick={() => addService(svc)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-arya-gold/10 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-arya-text truncate">{svc.name}</p>
                        <p className="font-sans text-[11px] text-arya-text-muted/60">
                          {CATEGORY_LABELS[svc.category as keyof typeof CATEGORY_LABELS] ?? svc.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-sans text-xs text-arya-text-muted">{formatPrice(svc.basePrice)}</span>
                        <Plus size={13} className="text-arya-green-dark" aria-hidden />
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* ── Notas ── */}
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Notas (opcional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej: 3 zonas, sesión 2 de 6…"
              className="px-3 py-2 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-arya-green/30"
            />
          </label>

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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
              Guardar turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
