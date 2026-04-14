import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  name:        z.string().min(1).max(200).trim(),
  category:    z.string().min(1).max(60).trim(),
  basePrice:   z.number().int().min(0),
  description: z.string().max(500).trim().optional(),
  isLaser:     z.boolean().optional(),
});

/** GET /api/services — lista todos los servicios (admin) */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const services = await db.service.findMany({
      orderBy: [{ category: "asc" }, { basePrice: "asc" }],
    });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
  }
}

/** POST /api/services — crea un servicio */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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

  const { name, category, basePrice, description, isLaser } = result.data;

  try {
    const service = await db.service.create({
      data: { name, category, basePrice, description: description ?? null, isLaser: isLaser ?? false },
    });
    return NextResponse.json(service, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 });
  }
}
