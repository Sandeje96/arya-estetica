import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  type: z.enum(["1day", "hours"]),
});

/**
 * PATCH /api/reminders/[id]
 * Marca el recordatorio de un turno como enviado.
 * La admin lo llama automáticamente al abrir el link de WhatsApp
 * (via un pequeño redirect o fetch en el cliente).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Tipo inválido. Usar '1day' o 'hours'" }, { status: 422 });
  }

  const { type } = result.data;

  try {
    const updated = await db.appointment.update({
      where: { id },
      data:  type === "1day"
        ? { reminder1DaySent: true }
        : { reminderHoursSent: true },
      select: { id: true, reminder1DaySent: true, reminderHoursSent: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
  }
}
