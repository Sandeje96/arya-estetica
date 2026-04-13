import type { Metadata } from "next";
import { db } from "@/lib/db";
import { JornadasClient, type LaserDayRow } from "@/components/admin/JornadasClient";

export const metadata: Metadata = { title: "Jornadas de depilación · Admin" };
export const dynamic = "force-dynamic";

async function getLaserDays(): Promise<LaserDayRow[]> {
  try {
    const days = await db.laserDay.findMany({
      orderBy: { date: "desc" },
      include: { _count: { select: { appointments: true } } },
    });

    return days.map((d) => ({
      id:          d.id,
      date:        d.date.toISOString(),
      slots:       d.slots,
      description: d.description,
      active:      d.active,
      booked:      d._count.appointments,
    }));
  } catch {
    return [];
  }
}

export default async function JornadasPage() {
  const laserDays = await getLaserDays();

  const activeCount = laserDays.filter(
    (d) => d.active && new Date(d.date) > new Date()
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-light text-arya-green-dark">
          Jornadas de depilación
        </h1>
        <p className="font-sans text-sm text-arya-text-muted mt-0.5">
          Las jornadas activas aparecen en el portal público para que las clientas puedan anotarse.
        </p>
      </div>

      {activeCount > 1 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
          <span className="font-sans text-sm text-amber-700">
            Hay <strong>{activeCount}</strong> jornadas activas simultáneamente. El portal muestra la más próxima.
          </span>
        </div>
      )}

      <JornadasClient laserDays={laserDays} />
    </div>
  );
}
