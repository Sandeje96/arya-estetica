"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  MessageSquare,
  X,
} from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/formatting";
import { isValidArgentinePhone } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(2, "Ingresá tu nombre").max(60).trim(),
  lastName:  z.string().min(2, "Ingresá tu apellido").max(60).trim(),
  whatsapp:  z.string().refine(isValidArgentinePhone, {
    message: "Número inválido. Ejemplo: 3764 285491",
  }),
  notes: z.string().max(500).trim().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Response del servidor ────────────────────────────────────────────────────

interface SuccessData {
  appointmentId: string;
  clientName: string;
  whatsapp: string;
  totalEstimated: number;
  services: string[];
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="font-sans text-xs text-destructive mt-1" role="alert">{message}</p>;
}

function InputField({
  label,
  icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-arya-text-muted/50">
          {icon}
        </span>
        <input
          {...props}
          className={cn(
            "w-full pl-10 pr-4 py-3 rounded-lg border bg-arya-cream-light font-sans text-sm text-arya-text placeholder:text-arya-text-muted/40 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-arya-green/40 focus:border-arya-green-soft",
            error ? "border-destructive" : "border-arya-gold/30"
          )}
        />
      </div>
      <FieldError message={error} />
    </label>
  );
}

// ─── Pantalla de confirmación ─────────────────────────────────────────────────

function Confirmation({ data }: { data: SuccessData }) {
  const waNumber = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? "5493764285491";
  const waMessage = `Hola! Soy ${data.clientName} y acabo de pedir un turno para: ${data.services.join(", ")}.`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-arya-green/10 text-arya-green">
        <CheckCircle2 size={36} aria-hidden />
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="font-heading text-3xl font-light text-arya-green-dark">
          ¡Gracias, {data.clientName.split(" ")[0]}!
        </h2>
        <p className="font-sans text-sm text-arya-text-muted leading-relaxed">
          Tu solicitud de turno fue registrada. Nos ponemos en contacto a tu WhatsApp para coordinar día y horario.
        </p>
      </div>

      {/* Resumen de servicios */}
      <div className="w-full max-w-sm border border-arya-gold/25 rounded-lg bg-arya-cream-light divide-y divide-arya-gold/10 text-left">
        <div className="px-4 py-2.5">
          <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">
            Servicios solicitados
          </span>
        </div>
        {data.services.map((name) => (
          <div key={name} className="px-4 py-2.5">
            <span className="font-sans text-sm text-arya-text">{name}</span>
          </div>
        ))}
        <div className="px-4 py-3 flex justify-between items-center bg-arya-cream rounded-b-lg">
          <span className="font-sans text-xs text-arya-text-muted">Total estimado</span>
          <span className="font-heading text-lg text-arya-green-dark">
            {formatPrice(data.totalEstimated)}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 flex-1 py-3 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors"
        >
          Escribirnos por WhatsApp
          <ArrowRight size={14} aria-hidden />
        </a>
        <Link
          href="/servicios"
          className="flex items-center justify-center flex-1 py-3 rounded-lg border border-arya-gold/40 text-arya-green-dark font-sans text-sm font-medium hover:bg-arya-gold/10 transition-colors"
        >
          Ver más servicios
        </Link>
      </div>
    </div>
  );
}

// ─── Formulario principal ─────────────────────────────────────────────────────

export function BookingForm() {
  const { items, total, remove, clear } = useCart();
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Carrito vacío
  if (items.length === 0 && !success) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 px-4 text-center">
        <ShoppingBag size={40} className="text-arya-gold/40" aria-hidden />
        <div>
          <h2 className="font-heading text-2xl text-arya-green-dark">
            Tu carrito está vacío
          </h2>
          <p className="font-sans text-sm text-arya-text-muted mt-2">
            Primero seleccioná los servicios que querés.
          </p>
        </div>
        <Link
          href="/servicios"
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors"
        >
          <ArrowLeft size={14} aria-hidden />
          Ir a servicios
        </Link>
      </div>
    );
  }

  // Pantalla de éxito
  if (success) return <Confirmation data={success} />;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          serviceIds: items.map((i) => i.id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Ocurrió un error. Intentá de nuevo.");
        return;
      }

      clear();
      setSuccess(data as SuccessData);
    } catch {
      setServerError("No se pudo conectar con el servidor. Revisá tu conexión.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto">

      {/* ── Columna formulario ────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col gap-5"
        noValidate
      >
        <h2 className="font-heading text-2xl font-light text-arya-green-dark">
          Tus datos
        </h2>

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
          error={errors.whatsapp?.message}
          {...register("whatsapp")}
        />
        <p className="font-sans text-[11px] text-arya-text-muted/60 -mt-3">
          Sin 0 ni 15. Ej: 3764 285491 o +54 9 3764 285491
        </p>

        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider flex items-center gap-1">
            <MessageSquare size={13} aria-hidden />
            Comentarios (opcional)
          </span>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="¿Alguna aclaración? ¿Horario de preferencia?"
            className={cn(
              "w-full px-4 py-3 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm text-arya-text placeholder:text-arya-text-muted/40 resize-none",
              "focus:outline-none focus:ring-2 focus:ring-arya-green/40 focus:border-arya-green-soft"
            )}
          />
          <FieldError message={errors.notes?.message} />
        </label>

        {/* Error del servidor */}
        {serverError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-sans" role="alert">
            <span className="shrink-0 mt-0.5">⚠️</span>
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium tracking-wide hover:bg-arya-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Enviando…
            </>
          ) : (
            <>
              Confirmar solicitud de turno
              <ArrowRight size={15} aria-hidden />
            </>
          )}
        </button>

        <p className="font-sans text-[11px] text-arya-text-muted/50 text-center">
          Al confirmar, nos contactamos para definir fecha y horario. No es un turno confirmado aún.
        </p>
      </form>

      {/* ── Resumen del carrito ────────────────────────────────────────────── */}
      <aside className="lg:w-72 shrink-0">
        <div className="sticky top-20 border border-arya-gold/25 rounded-xl bg-arya-cream-light overflow-hidden">
          <div className="px-4 py-3 border-b border-arya-gold/15">
            <h3 className="font-heading text-lg font-light text-arya-green-dark">
              Resumen
            </h3>
          </div>

          <ul className="divide-y divide-arya-gold/10">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs text-arya-text leading-snug">{item.name}</p>
                  <p className="font-sans text-xs text-arya-text-muted">{formatPrice(item.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="shrink-0 p-1 text-arya-text-muted/40 hover:text-arya-green-dark rounded transition-colors"
                  aria-label={`Quitar ${item.name}`}
                >
                  <X size={13} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <div className="px-4 py-3 border-t border-arya-gold/15 flex justify-between items-center">
            <span className="font-sans text-xs text-arya-text-muted">Total estimado</span>
            <span className="font-heading text-xl font-light text-arya-green-dark">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <Link
          href="/servicios"
          className="flex items-center gap-1.5 mt-3 text-xs text-arya-text-muted font-sans hover:text-arya-green-dark transition-colors"
        >
          <ArrowLeft size={12} aria-hidden />
          Agregar más servicios
        </Link>
      </aside>
    </div>
  );
}
