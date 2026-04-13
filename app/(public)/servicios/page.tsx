import type { Metadata } from "next";
import { LeafDecoration } from "@/components/brand/LeafDecoration";
import { ServiciosClient } from "@/components/public/ServiciosClient";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Conocé todos nuestros servicios de estética: capilares, uñas, masajes, cosmetología, maquillaje y más. Armá tu carrito y pedí turno.",
};

async function getServices() {
  try {
    return await db.service.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        category: true,
        basePrice: true,
        description: true,
        imageUrl: true,
        isLaser: true,
      },
      orderBy: [{ category: "asc" }, { basePrice: "asc" }],
    });
  } catch {
    // DB no disponible en dev sin configurar
    return [];
  }
}

async function hasActiveLaserDay(): Promise<boolean> {
  try {
    const today = new Date();
    const day = await db.laserDay.findFirst({
      where: {
        active: true,
        date: { gte: today },
      },
    });
    return day !== null;
  } catch {
    return false;
  }
}

export default async function ServiciosPage() {
  const [services, laserActive] = await Promise.all([
    getServices(),
    hasActiveLaserDay(),
  ]);

  return (
    <div className="relative min-h-screen bg-arya-cream">
      <LeafDecoration position="top-right" size="md" className="top-0 right-0" opacity={0.1} />

      {/* Header de sección */}
      <div className="bg-arya-cream-light border-b border-arya-gold/20 px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-arya-gold/40" />
            <span className="font-sans text-xs tracking-[0.25em] uppercase text-arya-gold">
              Nuestros servicios
            </span>
          </div>
          <h1 className="font-heading font-light text-4xl sm:text-5xl text-arya-green-dark">
            ¿Qué querés hacerte hoy?
          </h1>
          <p className="font-sans text-sm text-arya-text-muted max-w-lg mt-1">
            Seleccioná uno o más servicios, sumalos a tu carrito y pedí turno.
            Nos contactamos para coordinar día y horario.
          </p>
        </div>
      </div>

      {/* Contenido principal con carrito lateral */}
      <ServiciosClient services={services} hasActiveLaserDay={laserActive} />
    </div>
  );
}
