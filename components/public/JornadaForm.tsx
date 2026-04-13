"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Zap,
  User,
  Phone,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { formatPrice } from "@/lib/formatting";
import { isValidArgentinePhone } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface LaserService {
  id:        string;
  name:      string;
  basePrice: number;
}

export interface ActiveLaserDay {
  id:          string;
  date:        string;       // ISO
  slots:       number;
  booked:      number;
  description: string | null;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName:  z.string().min(2, "Ingresá tu nombre").max(60).trim(),
  lastName:   z.string().min(2, "Ingresá tu apellido").max(60).trim(),
  whatsapp:   z.string().refine(isValidArgentinePhone, "Número inválido. Ej: 3764 285491"),
});
type FormValues = z.infer<typeof schema>;

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="font-sans text-xs text-destructive mt-1" role="alert">{message}</p>;
}

function InputField({
  label, icon, error, hint, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; icon: React.ReactNode; error?: string; hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-arya-text-muted/50">{icon}</span>
        <input
          {...props}
          className={cn(
            "w-full pl-10 pr-4 py-3 rounded-lg border bg-arya-cream-light font-sans text-sm text-arya-text placeholder:text-arya-text-muted/40 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-arya-green/40 focus:border-arya-green-soft",
            error ? "border-destructive" : "border-arya-gold/30"
          )}
        />
      </div>
      {hint && !error && <p className="font-sans text-[11px] text-arya-text-muted/60">{hint}</p>}
      <FieldError message={error} />
    </label>
  );
}

// ─── Pantalla de confirmación ─────────────────────────────────────────────────

interface SuccessData {
  clientName:  string;
  services:    string[];
  dateLabel:   string;
}

function Confirmation({ data }: { data: SuccessData }) {
  const waNumber  = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? "5493764285491";
  const waMessage = `Hola! Me anoté para la jornada de depilación del ${data.dateLabel}. Soy ${data.clientName}, me anoté para: ${data.services.join(", ")}.`;
  const waLink    = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-arya-green/10 text-arya-green">
        <CheckCircle2 size={36} aria-hidden />
      </div>
      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="font-heading text-3xl font-light text-arya-green-dark">
          ¡Listo, {data.clientName.split(" ")[0]}!
        </h2>
        <p className="font-sans text-sm text-arya-text-muted leading-relaxed">
          Tu lugar en la jornada del <strong>{data.dateLabel}</strong> fue reservado.
          Nos contactamos para confirmar el horario puntual.
        </p>
      </div>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors"
      >
        Escribirnos por WhatsApp
        <ArrowRight size={14} aria-hidden />
      </a>
    </div>
  );
}

// ─── Selector de zonas ────────────────────────────────────────────────────────

function ZoneSelector({
  services,
  selected,
  onChange,
}: {
  services:  LaserService[];
  selected:  string[];
  onChange:  (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">
        Zonas a tratar *
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {services.map((srv) => {
          const isSelected = selected.includes(srv.id);
          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => toggle(srv.id)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all",
                isSelected
                  ? "border-arya-green-soft bg-arya-green/10 text-arya-green-dark"
                  : "border-arya-gold/30 bg-arya-cream-light text-arya-text hover:border-arya-gold/60"
              )}
            >
              <div>
                <p className="font-sans text-sm font-medium">{srv.name}</p>
                <p className="font-sans text-xs text-arya-text-muted">{formatPrice(srv.basePrice)}</p>
              </div>
              {isSelected && (
                <Check size={16} className="text-arya-green-dark shrink-0 ml-2" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  laserDay:  ActiveLaserDay;
  services:  LaserService[];
  dateLabel: string;
}

export function JornadaForm({ laserDay, services, dateLabel }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [success, setSuccess]         = useState<SuccessData | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [zoneError, setZoneError]     = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (success) return <Confirmation data={success} />;

  const remaining = laserDay.slots - laserDay.booked;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setZoneError(null);

    if (selectedIds.length === 0) {
      setZoneError("Seleccioná al menos una zona");
      return;
    }

    const res = await fetch("/api/appointments", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        firstName:  values.firstName,
        lastName:   values.lastName,
        whatsapp:   values.whatsapp,
        serviceIds: selectedIds,
        laserDayId: laserDay.id,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "Ocurrió un error. Intentá de nuevo.");
      return;
    }

    setSuccess({
      clientName: `${values.firstName} ${values.lastName}`,
      services:   data.services,
      dateLabel,
    });
  };

  const selectedTotal = selectedIds
    .map((id) => services.find((s) => s.id === id)?.basePrice ?? 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto">

      {/* ── Formulario ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-5" noValidate>

        <ZoneSelector
          services={services}
          selected={selectedIds}
          onChange={(ids) => { setSelectedIds(ids); setZoneError(null); }}
        />
        {zoneError && <p className="font-sans text-xs text-destructive -mt-3">{zoneError}</p>}

        <div className="border-t border-arya-gold/15 pt-5 flex flex-col gap-4">
          <h2 className="font-heading text-xl font-light text-arya-green-dark">Tus datos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Nombre *"
              icon={<User size={15} aria-hidden />}
              placeholder="Valentina"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <InputField
              label="Apellido *"
              icon={<User size={15} aria-hidden />}
              placeholder="Rodríguez"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <InputField
            label="WhatsApp *"
            icon={<Phone size={15} aria-hidden />}
            type="tel"
            placeholder="3764 285491"
            autoComplete="tel"
            inputMode="tel"
            hint="Sin 0 ni 15. Ej: 3764 285491"
            error={errors.whatsapp?.message}
            {...register("whatsapp")}
          />
        </div>

        {serverError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-sans" role="alert">
            <span className="shrink-0 mt-0.5">⚠️</span>
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium tracking-wide hover:bg-arya-green transition-colors disabled:opacity-60 shadow-sm"
        >
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" aria-hidden />Enviando…</>
          ) : (
            <><Zap size={15} aria-hidden />Reservar mi lugar<ArrowRight size={15} aria-hidden /></>
          )}
        </button>
      </form>

      {/* ── Panel resumen ────────────────────────────────────────────────── */}
      <aside className="lg:w-72 shrink-0">
        <div className="sticky top-20 border border-arya-gold/25 rounded-xl bg-arya-cream-light overflow-hidden">
          <div className="px-4 py-3 border-b border-arya-gold/15 flex items-center gap-2">
            <Zap size={14} className="text-arya-gold" aria-hidden />
            <h3 className="font-heading text-lg font-light text-arya-green-dark">Jornada</h3>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2">
            <p className="font-sans text-sm font-medium text-arya-text">{dateLabel}</p>
            {laserDay.description && (
              <p className="font-sans text-xs text-arya-text-muted">{laserDay.description}</p>
            )}
            <p className="font-sans text-xs text-arya-text-muted">
              {remaining > 0
                ? `${remaining} cupo${remaining !== 1 ? "s" : ""} disponible${remaining !== 1 ? "s" : ""}`
                : "Sin cupos disponibles"}
            </p>
          </div>

          {selectedIds.length > 0 && (
            <>
              <div className="border-t border-arya-gold/15 px-4 py-2">
                <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider mb-2">
                  Zonas seleccionadas
                </p>
                {selectedIds.map((id) => {
                  const srv = services.find((s) => s.id === id);
                  if (!srv) return null;
                  return (
                    <div key={id} className="flex justify-between py-1">
                      <span className="font-sans text-xs text-arya-text">{srv.name}</span>
                      <span className="font-sans text-xs text-arya-text-muted">{formatPrice(srv.basePrice)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-arya-gold/15 px-4 py-3 flex justify-between items-center">
                <span className="font-sans text-xs text-arya-text-muted">Total</span>
                <span className="font-heading text-xl font-light text-arya-green-dark">
                  {formatPrice(selectedTotal)}
                </span>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
