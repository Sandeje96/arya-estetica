import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Ventanas de tiempo para los recordatorios
const WINDOW_1DAY_MIN  = 20 * 60 * 60 * 1000; //  20 hs (mínimo)
const WINDOW_1DAY_MAX  = 26 * 60 * 60 * 1000; //  26 hs (máximo)
const WINDOW_HOURS_MIN =  2 * 60 * 60 * 1000; //   2 hs (mínimo)
const WINDOW_HOURS_MAX =  4 * 60 * 60 * 1000; //   4 hs (máximo)

/**
 * POST /api/reminders/cron
 *
 * Railway lo llama cada hora. Busca los turnos que entran en
 * la ventana de recordatorio y los devuelve para que el
 * dashboard los muestre como acciones pendientes.
 *
 * El endpoint NO envía WhatsApp; solo identifica candidatos.
 * La admin envía el recordatorio desde el dashboard haciendo
 * click en el link wa.me.
 *
 * Protegido por el header x-cron-secret.
 */
export async function POST(request: Request) {
  // Verificar secret
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();

  try {
    const candidates = await db.appointment.findMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: { not: null },
        OR: [
          {
            // ~24h antes: ventana de 20h a 26h
            reminder1DaySent: false,
            scheduledAt: {
              gte: new Date(now.getTime() + WINDOW_1DAY_MIN),
              lte: new Date(now.getTime() + WINDOW_1DAY_MAX),
            },
          },
          {
            // ~3h antes: ventana de 2h a 4h
            reminderHoursSent: false,
            scheduledAt: {
              gte: new Date(now.getTime() + WINDOW_HOURS_MIN),
              lte: new Date(now.getTime() + WINDOW_HOURS_MAX),
            },
          },
        ],
      },
      include: {
        client: { select: { firstName: true, lastName: true, whatsapp: true } },
      },
    });

    // Clasificar cada candidato según el tipo de recordatorio
    const reminders = candidates.map((appt) => {
      const msUntil = appt.scheduledAt!.getTime() - now.getTime();
      const is1Day  = msUntil >= WINDOW_1DAY_MIN && !appt.reminder1DaySent;
      return {
        appointmentId:   appt.id,
        clientName:      `${appt.client.firstName} ${appt.client.lastName}`,
        clientWhatsapp:  appt.client.whatsapp,
        scheduledAt:     appt.scheduledAt!.toISOString(),
        reminderType:    is1Day ? "1day" : "hours",
        alreadySent1Day: appt.reminder1DaySent,
        alreadySentHours: appt.reminderHoursSent,
      };
    });

    return NextResponse.json({
      ok:        true,
      checkedAt: now.toISOString(),
      found:     reminders.length,
      reminders,
    });
  } catch (error) {
    console.error("[POST /api/reminders/cron]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
