import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CalendarioClient } from "@/components/admin/CalendarioClient";

export const metadata: Metadata = { title: "Calendario · Admin" };

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

async function getAppointmentsForMonth(year: number, month: number) {
  // month es 0-indexed (Date de JS)
  const from = new Date(year, month, 1, 0, 0, 0);
  const to   = new Date(year, month + 1, 0, 23, 59, 59);

  try {
    const raw = await db.appointment.findMany({
      where: {
        scheduledAt: { gte: from, lte: to },
        status: { in: ["CONFIRMED", "COMPLETED", "PENDING"] },
      },
      include: {
        client: { select: { firstName: true, lastName: true, whatsapp: true } },
        items: { include: { service: { select: { name: true } } } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return raw.map((a) => ({
      ...a,
      scheduledAt:  a.scheduledAt!.toISOString(),
      createdAt:    a.createdAt.toISOString(),
      updatedAt:    a.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function CalendarioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now   = new Date();
  const year  = parseInt(params.year  ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth()),    10);

  const appointments = await getAppointmentsForMonth(year, month);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-light text-arya-green-dark">Calendario</h1>
        <p className="font-sans text-sm text-arya-text-muted mt-0.5">
          Turnos confirmados y completados. Hacé click en un día para ver los detalles.
        </p>
      </div>

      <CalendarioClient
        appointments={appointments}
        year={year}
        month={month}
      />
    </div>
  );
}
