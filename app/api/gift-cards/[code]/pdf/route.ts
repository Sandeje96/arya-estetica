import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateQRDataURL } from "@/lib/qr";
import { GiftCardPDF } from "@/lib/pdf/giftCard";

// Fuerza Node.js runtime (react-pdf no es compatible con Edge)
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { code } = await params;

  const giftCard = await db.giftCard.findUnique({
    where: { code },
    include: {
      items: {
        include: { service: { select: { name: true } } },
      },
    },
  });

  if (!giftCard) {
    return NextResponse.json({ error: "Gift card no encontrada" }, { status: 404 });
  }

  // Generar URL del QR apuntando a la página de validación
  const baseUrl  = process.env.PUBLIC_URL ?? "http://localhost:3000";
  const qrUrl    = `${baseUrl}/admin/gift-cards/validar/${code}`;
  const qrDataUrl = await generateQRDataURL(qrUrl);

  const services = giftCard.items.map((item) => ({
    name:            item.service.name,
    priceAtPurchase: item.priceAtPurchase,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(GiftCardPDF, {
    recipientName: giftCard.recipientName,
    services,
    totalAmount:   giftCard.totalAmount,
    qrDataUrl,
  }) as any;

  const pdfBuffer = await renderToBuffer(element);
  // Convertir Buffer a Uint8Array para que Response lo acepte
  const body = new Uint8Array(pdfBuffer);

  return new Response(body, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="gift-card-${code}.pdf"`,
      "Content-Length":      body.byteLength.toString(),
    },
  });
}
