import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** DELETE /api/gift-cards/[code] — elimina una gift card */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { code } = await params;

  try {
    await db.giftCard.delete({ where: { code } });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Gift card no encontrada" }, { status: 404 });
  }
}
