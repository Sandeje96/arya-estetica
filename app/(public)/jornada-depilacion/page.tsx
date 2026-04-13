import type { Metadata } from "next";
import { db } from "@/lib/db";
import { LeafDecoration } from "@/components/brand/LeafDecoration";
import { JornadaForm } from "@/components/public/JornadaForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Jornada de depilación láser · Arya Estética",
  description: "Reservá tu lugar en la próxima jornada de depilación láser definitiva con Soprano Ice Titanium.",
};

async function getActiveLaserDay() {
  try {
    return await db.laserDay.findFirst({
      where: {
        active: true,
        date:   { gt: new Date() },
      },
      orderBy: { date: "asc" },
      include: { _count: { select: { appointments: true } } },
    });
  } catch {
    return null;
  }
}

async function getLaserServices() {
  try {
    return await db.service.findMany({
      where:   { isLaser: true, active: true },
      select:  { id: true, name: true, basePrice: true },
      orderBy: { basePrice: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function JornadaDepilacionPage() {
  const [laserDay, services] = await Promise.all([
    getActiveLaserDay(),
    getLaserServices(),
  ]);

  const dateLabel = laserDay
    ? format(laserDay.date, "EEEE d 'de' MMMM yyyy", { locale: es })
    : null;

  return (
    <main className="relative min-h-screen bg-arya-cream overflow-x-hidden">
      <LeafDecoration position="top-right" className="opacity-30" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <p className="font-sans text-xs text-arya-gold uppercase tracking-widest mb-3">
            Soprano Ice Titanium
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-arya-green-dark mb-4">
            Jornada de depilación láser
          </h1>
          {laserDay ? (
            <p className="font-sans text-sm text-arya-text-muted max-w-md mx-auto leading-relaxed">
              Próxima jornada: <strong className="text-arya-green-dark">{dateLabel}</strong>.
              Reservá tu lugar eligiendo las zonas que querés tratar.
            </p>
          ) : (
            <p className="font-sans text-sm text-arya-text-muted max-w-md mx-auto leading-relaxed">
              En este momento no hay jornadas programadas. Seguinos en{" "}
              <a
                href="https://instagram.com/arya_estetica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-arya-green-dark underline underline-offset-2"
              >
                @arya_estetica
              </a>{" "}
              para enterarte cuando abrimos inscripciones.
            </p>
          )}
        </div>

        {laserDay && services.length > 0 ? (
          <JornadaForm
            laserDay={{
              id:          laserDay.id,
              date:        laserDay.date.toISOString(),
              slots:       laserDay.slots,
              booked:      laserDay._count.appointments,
              description: laserDay.description,
            }}
            services={services}
            dateLabel={dateLabel!}
          />
        ) : !laserDay ? (
          <div className="flex justify-center mt-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-arya-gold/40 text-arya-green-dark font-sans text-sm font-medium hover:bg-arya-gold/10 transition-colors"
            >
              <ArrowLeft size={14} aria-hidden />
              Volver al inicio
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
