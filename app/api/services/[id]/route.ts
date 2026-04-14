import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  name:        z.string().min(1).max(200).trim().optional(),
  category:    z.string().min(1).max(60).trim().optional(),
  basePrice:   z.number().int().min(0).optional(),
  description: z.string().max(500).trim().nullable().optional(),
  active:      z.boolean().optional(),
  isLaser:     z.boolean().optional(),
});

/** PATCH /api/services/[id] — actualiza un servicio */
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

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 422 }
    );
  }

  try {
    const service = await db.service.update({
      where: { id },
      data:  result.data,
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }
}

/** DELETE /api/services/[id] — elimina un servicio (solo si no tiene turnos asociados) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    // Verificar si tiene items de turno asociados
    const usageCount = await db.appointmentItem.count({ where: { serviceId: id } });
    if (usageCount > 0) {
      // En lugar de borrar, desactivar para preservar el historial
      await db.service.update({ where: { id }, data: { active: false } });
      return NextResponse.json({ deactivated: true });
    }
    await db.service.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 });
  }
}
