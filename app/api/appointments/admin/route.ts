import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  client: z.object({
    firstName: z.string().min(1).max(100).trim(),
    lastName:  z.string().min(1).max(100).trim(),
    whatsapp:  z.string().min(6).max(20).trim(),
  }),
  items: z.array(z.object({
    serviceId: z.string(),
    price:     z.number().int().min(0),
  })).min(1),
  scheduledAt:  z.string().datetime(),
  totalCharged: z.number().int().min(0),
  notes:        z.string().max(500).trim().optional(),
});

/** POST /api/appointments/admin — crea un turno completado directamente */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Datos inválidos", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { client, items, scheduledAt, totalCharged, notes } = result.data;

  try {
    // Buscar cliente existente por whatsapp o crear uno nuevo
    let dbClient = await db.client.findFirst({
      where: { whatsapp: client.whatsapp },
    });

    if (!dbClient) {
      dbClient = await db.client.create({
        data: {
          firstName: client.firstName,
          lastName:  client.lastName,
          whatsapp:  client.whatsapp,
        },
      });
    }

    const appointment = await db.appointment.create({
      data: {
        clientId:       dbClient.id,
        status:         "COMPLETED",
        scheduledAt:    new Date(scheduledAt),
        totalEstimated: items.reduce((s, i) => s + i.price, 0),
        totalCharged,
        notes:          notes ?? null,
        items: {
          create: items.map((i) => ({
            serviceId:     i.serviceId,
            priceAtBooking: i.price,
            finalPrice:     i.price,
          })),
        },
      },
      include: {
        client: { select: { firstName: true, lastName: true, whatsapp: true } },
        items:  { include: { service: { select: { name: true } } } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/appointments/admin]", error);
    return NextResponse.json({ error: "Error al crear el turno" }, { status: 500 });
  }
}
