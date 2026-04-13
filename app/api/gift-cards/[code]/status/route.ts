import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  status: z.enum(["READY", "CANCELLED"]),
});

/**
 * PATCH /api/gift-cards/[code]/status
 * Permite cambiar el estado entre PENDING_PICKUP → READY, o cualquier estado → CANCELLED.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { code } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 422 });
  }

  const giftCard = await db.giftCard.findUnique({ where: { code } });
  if (!giftCard) {
    return NextResponse.json({ error: "Gift card no encontrada" }, { status: 404 });
  }

  if (giftCard.status === "REDEEMED") {
    return NextResponse.json({ error: "No se puede modificar una gift card ya utilizada" }, { status: 409 });
  }

  const updated = await db.giftCard.update({
    where: { code },
    data:  { status: result.data.status },
    select: { code: true, status: true },
  });

  return NextResponse.json(updated);
}
