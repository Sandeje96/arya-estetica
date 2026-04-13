import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const patchSchema = z.object({
  amount:      z.number().int().min(1).optional(),
  category:    z.string().min(1).max(60).trim().optional(),
  description: z.string().max(500).trim().optional().nullable(),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
});

/** PATCH /api/expenses/[id] */
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

  const { date, ...rest } = result.data;

  try {
    const updated = await db.expense.update({
      where: { id },
      data:  { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });
    return NextResponse.json({
      ...updated,
      date:      updated.date.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
  }
}

/** DELETE /api/expenses/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    await db.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
  }
}
