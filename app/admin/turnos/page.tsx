import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { db } from "@/lib/db";
import { TurnosClient } from "@/components/admin/TurnosClient";

export const metadata: Metadata = { title: "Turnos · Admin" };

async function getAppointments() {
  try {
    const raw = await db.appointment.findMany({
      orderBy: [
        // Pendientes primero, luego confirmados, luego el resto
        { status: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        client: { select: { firstName: true, lastName: true, whatsapp: true } },
        items: {
          include: { service: { select: { name: true } } },
        },
      },
    });

    // Serializar fechas a string para pasar como props al client component
    return raw.map((a) => ({
      ...a,
      scheduledAt:  a.scheduledAt?.toISOString()  ?? null,
      createdAt:    a.createdAt.toISOString(),
      updatedAt:    a.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function TurnosPage() {
  const appointments = await getAppointments();

  const pending = appointments.filter((a) => a.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-light text-arya-green-dark">Turnos</h1>
          <p className="font-sans text-sm text-arya-text-muted mt-0.5">
            {appointments.length === 0
              ? "No hay turnos registrados aún."
              : `${appointments.length} turno${appointments.length !== 1 ? "s" : ""} en total${pending > 0 ? ` · ${pending} pendiente${pending !== 1 ? "s" : ""}` : ""}`}
          </p>
        </div>

        {/* Link rápido a jornadas láser */}
        <Link
          href="/admin/jornadas"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-arya-gold/30 text-arya-green-dark font-sans text-sm hover:bg-arya-gold/10 transition-colors shrink-0"
        >
          <CalendarPlus size={14} aria-hidden />
          Jornada láser
        </Link>
      </div>

      {/* Notificación de pendientes */}
      {pending > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-arya-gold/10 border border-arya-gold/30">
          <span className="text-lg" aria-hidden>⏳</span>
          <p className="font-sans text-sm text-arya-text">
            Tenés <strong>{pending} turno{pending !== 1 ? "s" : ""} pendiente{pending !== 1 ? "s" : ""}</strong> esperando confirmación.
          </p>
        </div>
      )}

      {/* Tabla de turnos */}
      <TurnosClient appointments={appointments} />
    </div>
  );
}
