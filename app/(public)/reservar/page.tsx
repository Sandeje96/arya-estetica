import type { Metadata } from "next";
import { LeafDecoration } from "@/components/brand/LeafDecoration";
import { BookingForm } from "@/components/public/BookingForm";

export const metadata: Metadata = {
  title: "Reservar turno",
  description:
    "Pedí tu turno en Arya Estética. Completá tus datos y te contactamos para coordinar día y horario.",
};

export default function ReservarPage() {
  return (
    <div className="relative min-h-screen bg-arya-cream">
      <LeafDecoration position="top-left" size="md" className="top-0 left-0" opacity={0.1} />
      <LeafDecoration position="bottom-right" size="sm" className="bottom-0 right-0" opacity={0.08} />

      {/* Header de sección */}
      <div className="bg-arya-cream-light border-b border-arya-gold/20 px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-arya-gold/40" />
            <span className="font-sans text-xs tracking-[0.25em] uppercase text-arya-gold">
              Solicitud de turno
            </span>
          </div>
          <h1 className="font-heading font-light text-4xl sm:text-5xl text-arya-green-dark">
            Reservar turno
          </h1>
          <p className="font-sans text-sm text-arya-text-muted max-w-md mt-1">
            Completá tus datos y nos ponemos en contacto por WhatsApp para coordinar el mejor momento.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="px-4 sm:px-6 py-10">
        <BookingForm />
      </div>
    </div>
  );
}
