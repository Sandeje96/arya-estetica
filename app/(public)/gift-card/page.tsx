import type { Metadata } from "next";
import { LeafDecoration } from "@/components/brand/LeafDecoration";
import { GiftCardForm } from "@/components/public/GiftCardForm";

export const metadata: Metadata = {
  title: "Gift Card · Arya Estética",
  description: "Regalá una experiencia de bienestar. Elegí los servicios y creamos una tarjeta personalizada para quien quieras.",
};

export default function GiftCardPage() {
  return (
    <main className="relative min-h-screen bg-arya-cream overflow-x-hidden">
      <LeafDecoration position="top-right" className="opacity-30" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <p className="font-sans text-xs text-arya-gold uppercase tracking-widest mb-3">
            El regalo perfecto
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-arya-green-dark mb-4">
            Gift Card Arya Estética
          </h1>
          <p className="font-sans text-sm text-arya-text-muted max-w-md mx-auto leading-relaxed">
            Seleccioná los servicios que querés incluir, completá los datos y te enviamos la tarjeta física lista para regalar.
          </p>
        </div>

        {/* Formulario */}
        <GiftCardForm />
      </div>
    </main>
  );
}
