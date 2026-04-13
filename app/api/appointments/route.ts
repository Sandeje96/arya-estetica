import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeWhatsapp, isValidArgentinePhone } from "@/lib/whatsapp";

// ─── Validación ───────────────────────────────────────────────────────────────

const createAppointmentSchema = z.object({
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60)
    .trim(),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(60)
    .trim(),
  whatsapp: z.string().refine(isValidArgentinePhone, {
    message: "Ingresá un número de WhatsApp argentino válido (ej: 3764 285491)",
  }),
  notes: z.string().max(500).trim().optional(),
  serviceIds: z
    .array(z.string().cuid())
    .min(1, "Seleccioná al menos un servicio"),
  // Para jornadas de depilación láser
  laserDayId: z.string().cuid().optional(),
});

// ─── POST /api/appointments ───────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }

  const result = createAppointmentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { firstName, lastName, whatsapp, notes, serviceIds, laserDayId } = result.data;
  const normalizedPhone = normalizeWhatsapp(whatsapp);

  try {
    // Verificar que todos los servicios existan y estén activos
    const services = await db.service.findMany({
      where: { id: { in: serviceIds }, active: true },
      select: { id: true, name: true, basePrice: true },
    });

    if (services.length === 0) {
      return NextResponse.json({ error: "No se encontraron servicios válidos" }, { status: 422 });
    }

    // Buscar o crear cliente por WhatsApp
    let client = await db.client.findFirst({
      where: { whatsapp: normalizedPhone },
    });

    if (!client) {
      client = await db.client.create({
        data: { firstName, lastName, whatsapp: normalizedPhone },
      });
    }

    // Calcular total con precios reales de la DB (no confiar en el cliente)
    const totalEstimated = services.reduce((sum, svc) => sum + svc.basePrice, 0);

    // Si es jornada láser, verificar que existe y tiene cupos
    if (laserDayId) {
      const laserDay = await db.laserDay.findUnique({
        where: { id: laserDayId },
        include: { _count: { select: { appointments: true } } },
      });
      if (!laserDay || !laserDay.active) {
        return NextResponse.json({ error: "Jornada no disponible" }, { status: 422 });
      }
      if (laserDay._count.appointments >= laserDay.slots) {
        return NextResponse.json({ error: "No quedan cupos disponibles en esa jornada" }, { status: 409 });
      }
    }

    // Crear turno con sus items
    const appointment = await db.appointment.create({
      data: {
        clientId: client.id,
        totalEstimated,
        notes:      notes ?? null,
        isLaserDay: !!laserDayId,
        laserDayId: laserDayId ?? null,
        // Para jornada láser el scheduledAt se fija al día de la jornada
        scheduledAt: laserDayId
          ? await db.laserDay.findUnique({ where: { id: laserDayId }, select: { date: true } })
              .then((d) => d?.date ?? null)
          : null,
        items: {
          create: services.map((svc) => ({
            serviceId: svc.id,
            priceAtBooking: svc.basePrice,
          })),
        },
      },
      include: {
        items: {
          include: { service: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(
      {
        appointmentId: appointment.id,
        clientName: `${firstName} ${lastName}`,
        whatsapp: normalizedPhone,
        totalEstimated,
        services: appointment.items.map((i) => i.service.name),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/appointments]", error);
    return NextResponse.json(
      { error: "Hubo un problema al guardar el turno. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
