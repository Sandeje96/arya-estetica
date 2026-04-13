"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Zap,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  CalendarDays,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface LaserDayRow {
  id:          string;
  date:        string;
  slots:       number;
  description: string | null;
  active:      boolean;
  booked:      number;
}

// ─── Schema del formulario de creación ───────────────────────────────────────

const createSchema = z.object({
  date:        z.string().min(1, "Elegí una fecha"),
  time:        z.string().min(1, "Elegí una hora"),
  slots:       z.number().int().min(1, "Al menos 1 cupo").max(200),
  description: z.string().max(500).trim().optional(),
});
type CreateValues = z.infer<typeof createSchema>;

// ─── Modal de nueva jornada ───────────────────────────────────────────────────

function NewJornadaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (day: LaserDayRow) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { slots: 20 },
  });

  const onSubmit = async (values: CreateValues) => {
    setServerError(null);
    // Combinar fecha + hora en ISO
    const date = new Date(`${values.date}T${values.time}:00`);
    if (isNaN(date.getTime())) {
      setServerError("Fecha u hora inválida");
      return;
    }

    const res = await fetch("/api/laser-days", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        date:        date.toISOString(),
        slots:       values.slots,
        description: values.description || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "Error al crear la jornada");
      return;
    }
    onCreated({ ...data, booked: 0, date: data.date });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-arya-cream rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92svh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-arya-gold/20 bg-arya-cream-light shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-arya-green-dark" aria-hidden />
            <h2 className="font-heading text-lg font-light text-arya-green-dark">
              Nueva jornada
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-arya-text-muted/50 hover:text-arya-text-muted hover:bg-arya-gold/10 transition-colors" aria-label="Cerrar">
            <X size={16} aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 flex flex-col gap-4 overflow-y-auto" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Fecha *</span>
              <input
                type="date"
                {...register("date")}
                className={cn(
                  "px-3 py-2.5 rounded-lg border bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30",
                  errors.date ? "border-destructive" : "border-arya-gold/30"
                )}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Hora *</span>
              <input
                type="time"
                defaultValue="09:00"
                {...register("time")}
                className={cn(
                  "px-3 py-2.5 rounded-lg border bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30",
                  errors.time ? "border-destructive" : "border-arya-gold/30"
                )}
              />
              {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Cupos disponibles *</span>
            <input
              type="number"
              min={1}
              max={200}
              {...register("slots", { valueAsNumber: true })}
              className={cn(
                "px-3 py-2.5 rounded-lg border bg-arya-cream-light font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30",
                errors.slots ? "border-destructive" : "border-arya-gold/30"
              )}
            />
            {errors.slots && <p className="text-xs text-destructive">{errors.slots.message}</p>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Descripción (opcional)</span>
            <textarea
              rows={2}
              placeholder="Ej: Jornada de mayo. Soprano Ice Titanium."
              {...register("description")}
              className="px-3 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-arya-green/30"
            />
          </label>

          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-sans" role="alert">
              <AlertTriangle size={14} className="shrink-0" aria-hidden />
              {serverError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-sm hover:bg-arya-gold/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Plus size={14} aria-hidden />}
              Crear jornada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  laserDays: LaserDayRow[];
}

export function JornadasClient({ laserDays: initial }: Props) {
  const [days, setDays]         = useState(initial);
  const [showModal, setModal]   = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreated = (day: LaserDayRow) => {
    setDays((prev) => [day, ...prev]);
    router.refresh();
  };

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await fetch(`/api/laser-days/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ active: !current }),
      });
      if (res.ok) {
        setDays((prev) =>
          prev.map((d) => (d.id === id ? { ...d, active: !current } : d))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar esta jornada?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/laser-days/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDays((prev) => prev.filter((d) => d.id !== id));
      } else {
        const data = await res.json();
        alert(data.error ?? "No se pudo eliminar");
      }
    });
  };

  const now = new Date();

  return (
    <>
      {showModal && (
        <NewJornadaModal
          onClose={() => setModal(false)}
          onCreated={handleCreated}
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors shadow-sm"
          >
            <Plus size={15} aria-hidden />
            Nueva jornada
          </button>
        </div>

        {days.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-5 rounded-xl border border-arya-gold/20 bg-arya-cream-light text-arya-text-muted">
            <Zap size={16} className="text-arya-gold shrink-0" aria-hidden />
            <p className="font-sans text-sm">
              No hay jornadas creadas aún. Creá la primera para que aparezca en el portal.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-arya-gold/20 bg-arya-cream-light overflow-hidden divide-y divide-arya-gold/10">
            {days.map((day) => {
              const date    = new Date(day.date);
              const isPast  = date < now;
              const remaining = day.slots - day.booked;

              return (
                <div key={day.id} className={cn("flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4", isPast && "opacity-60")}>
                  {/* Fecha */}
                  <div className="shrink-0 w-14 text-center hidden sm:block">
                    <p className="font-heading text-2xl font-light text-arya-green-dark leading-none">
                      {format(date, "d")}
                    </p>
                    <p className="font-sans text-[10px] uppercase text-arya-text-muted tracking-wide">
                      {format(date, "MMM", { locale: es })}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans text-sm font-medium text-arya-text">
                        {format(date, "EEEE d 'de' MMMM yyyy", { locale: es })}
                      </span>
                      <span className="font-sans text-xs text-arya-text-muted">
                        {format(date, "HH:mm")} hs
                      </span>
                      {isPast && (
                        <span className="text-[10px] font-sans text-arya-text-muted/60 border border-arya-text-muted/20 rounded-full px-2 py-0.5">
                          pasada
                        </span>
                      )}
                      {!isPast && day.active && (
                        <span className="text-[10px] font-sans text-arya-green-dark bg-arya-green/10 border border-arya-green-soft/30 rounded-full px-2 py-0.5">
                          activa
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 font-sans text-xs text-arya-text-muted">
                        <Users size={11} aria-hidden />
                        {day.booked}/{day.slots} cupos
                        {remaining > 0 && !isPast ? ` · ${remaining} disponibles` : ""}
                      </span>
                      {day.description && (
                        <span className="font-sans text-xs text-arya-text-muted/70 truncate max-w-xs">
                          {day.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle activo/inactivo */}
                    <button
                      onClick={() => handleToggleActive(day.id, day.active)}
                      disabled={isPending}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans transition-colors",
                        day.active
                          ? "border-arya-green-soft/40 text-arya-green-dark hover:bg-arya-green/10"
                          : "border-arya-gold/30 text-arya-text-muted hover:bg-arya-gold/10"
                      )}
                      title={day.active ? "Desactivar" : "Activar"}
                    >
                      {day.active
                        ? <ToggleRight size={14} aria-hidden />
                        : <ToggleLeft  size={14} aria-hidden />}
                      {day.active ? "Activa" : "Inactiva"}
                    </button>

                    {/* Eliminar (solo si no tiene turnos) */}
                    {day.booked === 0 && (
                      <button
                        onClick={() => handleDelete(day.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg border border-destructive/20 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Eliminar jornada"
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
