import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Categorías predefinidas (mismo orden que el seed)
export const EXPENSE_CATEGORIES = [
  "alquiler",
  "insumos",
  "sueldos",
  "marketing",
  "servicios",
  "impuestos",
  "otros",
] as const;

const createSchema = z.object({
  amount:      z.number().int().min(1, "El monto debe ser mayor a 0"),
  category:    z.string().min(1).max(60).trim(),
  description: z.string().max(500).trim().optional(),
  date:        z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

/** GET /api/expenses — lista gastos con filtro opcional de mes */
export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year  = parseInt(searchParams.get("year")  ?? "0", 10);
  const month = parseInt(searchParams.get("month") ?? "-1", 10);

  const where =
    year > 0 && month >= 0
      ? {
          date: {
            gte: new Date(year, month, 1),
            lte: new Date(year, month + 1, 0, 23, 59, 59),
          },
        }
      : {};

  try {
    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(
      expenses.map((e) => ({
        ...e,
        date:      e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Error al obtener gastos" }, { status: 500 });
  }
}

/** POST /api/expenses — crea un gasto */
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

  const { amount, category, description, date } = result.data;

  const expense = await db.expense.create({
    data: {
      amount,
      category,
      description: description ?? null,
      date:        new Date(date),
    },
  });

  return NextResponse.json(
    { ...expense, date: expense.date.toISOString(), createdAt: expense.createdAt.toISOString() },
    { status: 201 }
  );
}
