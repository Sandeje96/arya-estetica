import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  date:        z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  slots:       z.number().int().min(1).max(200),
  description: z.string().max(500).trim().optional(),
});

/** GET /api/laser-days — lista todas las jornadas (requiere auth) */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const days = await db.laserDay.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { appointments: true } } },
  });

  return NextResponse.json(days.map((d) => ({
    id:           d.id,
    date:         d.date.toISOString(),
    slots:        d.slots,
    description:  d.description,
    active:       d.active,
    booked:       d._count.appointments,
  })));
}

/** POST /api/laser-days — crea nueva jornada */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 422 }
    );
  }

  const day = await db.laserDay.create({
    data: {
      date:        new Date(result.data.date),
      slots:       result.data.slots,
      description: result.data.description ?? null,
      active:      true,
    },
  });

  return NextResponse.json(day, { status: 201 });
}
