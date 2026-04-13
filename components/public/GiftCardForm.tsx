"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Gift,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  Heart,
  X,
} from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/formatting";
import { isValidArgentinePhone } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  // Comprador
  buyerFirstName: z.string().min(2, "Ingresá tu nombre").max(60).trim(),
  buyerLastName:  z.string().min(2, "Ingresá tu apellido").max(60).trim(),
  buyerWhatsapp:  z.string().refine(isValidArgentinePhone, {
    message: "Número inválido. Ejemplo: 3764 285491",
  }),
  // Destinataria
  recipientName: z.string().min(2, "Ingresá el nombre del destinatario").max(120).trim(),
});

type FormValues = z.infer<typeof schema>;

interface SuccessData {
  code: string;
  recipientName: string;
  buyerName: string;
  services: string[];
  totalAmount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="font-sans text-xs text-destructive mt-1" role="alert">{message}</p>;
}

function InputField({
  label,
  icon,
  error,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ReactNode;
  error?: string;
  hint?: string;
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
      {hint && !error && (
        <p className="font-sans text-[11px] text-arya-text-muted/60">{hint}</p>
      )}
      <FieldError message={error} />
    </label>
  );
}

// ─── Pantalla de confirmación ─────────────────────────────────────────────────

function Confirmation({ data }: { data: SuccessData }) {
  const waNumber  = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? "5493764285491";
  const waMessage = `Hola! Soy ${data.buyerName} y acabo de pedir una gift card para ${data.recipientName} con los servicios: ${data.services.join(", ")}.`;
  const waLink    = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-arya-gold/10 text-arya-gold">
        <Gift size={34} aria-hidden />
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="font-heading text-3xl font-light text-arya-green-dark">
          ¡Gracias, {data.buyerName.split(" ")[0]}!
        </h2>
        <p className="font-sans text-sm text-arya-text-muted leading-relaxed">
          Tu pedido de gift card fue registrado. Nos ponemos en contacto a tu WhatsApp para coordinar el pago y la entrega de la tarjeta física.
        </p>
      </div>

      {/* Resumen */}
      <div className="w-full max-w-sm border border-arya-gold/25 rounded-lg bg-arya-cream-light divide-y divide-arya-gold/10 text-left">
        <div className="px-4 py-2.5 flex items-center gap-2">
          <Heart size={13} className="text-arya-gold" aria-hidden />
          <span className="font-sans text-xs text-arya-text-muted">
            Para: <strong className="text-arya-text">{data.recipientName}</strong>
          </span>
        </div>
        {data.services.map((name) => (
          <div key={name} className="px-4 py-2.5">
            <span className="font-sans text-sm text-arya-text">{name}</span>
          </div>
        ))}
        <div className="px-4 py-3 flex justify-between items-center bg-arya-cream rounded-b-lg">
          <span className="font-sans text-xs text-arya-text-muted">Total</span>
          <span className="font-heading text-lg text-arya-green-dark">
            {formatPrice(data.totalAmount)}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 flex-1 py-3 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors"
        >
          Coordinar por WhatsApp
          <ArrowRight size={14} aria-hidden />
        </a>
        <Link
          href="/"
          className="flex items-center justify-center flex-1 py-3 rounded-lg border border-arya-gold/40 text-arya-green-dark font-sans text-sm font-medium hover:bg-arya-gold/10 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

// ─── Formulario principal ─────────────────────────────────────────────────────

export function GiftCardForm() {
  const { items, total, remove, clear } = useCart();
  const [success, setSuccess]           = useState<SuccessData | null>(null);
  const [serverError, setServerError]   = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Carrito vacío
  if (items.length === 0 && !success) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 px-4 text-center">
        <Gift size={40} className="text-arya-gold/40" aria-hidden />
        <div>
          <h2 className="font-heading text-2xl text-arya-green-dark">
            Seleccioná los servicios
          </h2>
          <p className="font-sans text-sm text-arya-text-muted mt-2">
            Primero elegí los servicios que querés incluir en la gift card.
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

  if (success) return <Confirmation data={success} />;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerFirstName: values.buyerFirstName,
          buyerLastName:  values.buyerLastName,
          buyerWhatsapp:  values.buyerWhatsapp,
          recipientName:  values.recipientName,
          serviceIds:     items.map((i) => i.id),
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

      {/* ── Formulario ─────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col gap-5"
        noValidate
      >
        {/* Sección compradora */}
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-light text-arya-green-dark border-b border-arya-gold/20 pb-2">
            Tus datos (quién compra)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Nombre *"
              icon={<User size={15} aria-hidden />}
              placeholder="Valentina"
              autoComplete="given-name"
              error={errors.buyerFirstName?.message}
              {...register("buyerFirstName")}
            />
            <InputField
              label="Apellido *"
              icon={<User size={15} aria-hidden />}
              placeholder="Rodríguez"
              autoComplete="family-name"
              error={errors.buyerLastName?.message}
              {...register("buyerLastName")}
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
            error={errors.buyerWhatsapp?.message}
            {...register("buyerWhatsapp")}
          />
        </div>

        {/* Sección destinataria */}
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-light text-arya-green-dark border-b border-arya-gold/20 pb-2">
            Para quién es el regalo
          </h2>
          <InputField
            label="Nombre del destinatario *"
            icon={<Heart size={15} aria-hidden />}
            placeholder="María García"
            hint="Aparecerá impreso en la tarjeta física"
            error={errors.recipientName?.message}
            {...register("recipientName")}
          />
        </div>

        {serverError && (
          <div
            className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-sans"
            role="alert"
          >
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
              <Gift size={15} aria-hidden />
              Pedir gift card
              <ArrowRight size={15} aria-hidden />
            </>
          )}
        </button>

        <p className="font-sans text-[11px] text-arya-text-muted/50 text-center">
          Te contactamos para coordinar el pago y la entrega de la tarjeta física.
        </p>
      </form>

      {/* ── Resumen ─────────────────────────────────────────────────────────── */}
      <aside className="lg:w-72 shrink-0">
        <div className="sticky top-20 border border-arya-gold/25 rounded-xl bg-arya-cream-light overflow-hidden">
          <div className="px-4 py-3 border-b border-arya-gold/15 flex items-center gap-2">
            <Gift size={14} className="text-arya-gold" aria-hidden />
            <h3 className="font-heading text-lg font-light text-arya-green-dark">
              Servicios incluidos
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
            <span className="font-sans text-xs text-arya-text-muted">Total</span>
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
