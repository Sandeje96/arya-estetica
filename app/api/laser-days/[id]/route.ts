import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const patchSchema = z.object({
  active:      z.boolean().optional(),
  slots:       z.number().int().min(1).optional(),
  description: z.string().max(500).trim().optional(),
});

/** PATCH /api/laser-days/[id] — activa/desactiva o edita slots */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });
  }

  try {
    const updated = await db.laserDay.update({
      where: { id },
      data:  result.data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Jornada no encontrada" }, { status: 404 });
  }
}

/** DELETE /api/laser-days/[id] — elimina si no tiene turnos */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const count = await db.appointment.count({ where: { laserDayId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar una jornada con turnos anotados" },
      { status: 409 }
    );
  }

  try {
    await db.laserDay.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Jornada no encontrada" }, { status: 404 });
  }
}
