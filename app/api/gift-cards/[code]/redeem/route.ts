import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/gift-cards/[code]/redeem
 * Marca la gift card como utilizada (REDEEMED).
 * Solo funciona si el estado actual es READY.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { code } = await params;

  const giftCard = await db.giftCard.findUnique({ where: { code } });

  if (!giftCard) {
    return NextResponse.json({ error: "Gift card no encontrada" }, { status: 404 });
  }

  if (giftCard.status === "REDEEMED") {
    return NextResponse.json(
      {
        error: "Esta gift card ya fue utilizada",
        redeemedAt: giftCard.redeemedAt?.toISOString(),
      },
      { status: 409 }
    );
  }

  if (giftCard.status === "CANCELLED") {
    return NextResponse.json({ error: "Esta gift card está cancelada" }, { status: 409 });
  }

  if (giftCard.status === "PENDING_PICKUP") {
    return NextResponse.json(
      { error: "La gift card aún no fue entregada. Cambiá el estado a 'Lista' primero." },
      { status: 409 }
    );
  }

  const updated = await db.giftCard.update({
    where: { code },
    data:  { status: "REDEEMED", redeemedAt: new Date() },
  });

  return NextResponse.json({
    ok:         true,
    code:       updated.code,
    redeemedAt: updated.redeemedAt?.toISOString(),
  });
}
