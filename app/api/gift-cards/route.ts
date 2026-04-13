import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { normalizeWhatsapp, isValidArgentinePhone } from "@/lib/whatsapp";

const schema = z.object({
  buyerFirstName: z.string().min(2).max(60).trim(),
  buyerLastName:  z.string().min(2).max(60).trim(),
  buyerWhatsapp:  z.string().refine(isValidArgentinePhone, "Número inválido"),
  recipientName:  z.string().min(2).max(120).trim(),
  serviceIds:     z.array(z.string().cuid()).min(1, "Seleccioná al menos un servicio"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 422 }
    );
  }

  const { buyerFirstName, buyerLastName, buyerWhatsapp, recipientName, serviceIds } =
    result.data;

  // Verificar servicios y obtener precios desde la DB (nunca confiar en el cliente)
  const services = await db.service.findMany({
    where: { id: { in: serviceIds }, active: true },
    select: { id: true, name: true, basePrice: true },
  });

  if (services.length === 0) {
    return NextResponse.json({ error: "Ningún servicio válido seleccionado" }, { status: 422 });
  }

  const totalAmount = services.reduce((sum, s) => sum + s.basePrice, 0);
  const normalizedPhone = normalizeWhatsapp(buyerWhatsapp);

  try {
    // Buscar o crear cliente por WhatsApp (igual que en appointments)
    let buyer = await db.client.findFirst({ where: { whatsapp: normalizedPhone } });
    if (!buyer) {
      buyer = await db.client.create({
        data: { firstName: buyerFirstName, lastName: buyerLastName, whatsapp: normalizedPhone },
      });
    }

    // Crear gift card con código único
    const code = nanoid(12);

    await db.giftCard.create({
      data: {
        code,
        buyerId:       buyer.id,
        recipientName,
        totalAmount,
        status:        "PENDING_PICKUP",
        items: {
          create: services.map((s) => ({
            serviceId:       s.id,
            priceAtPurchase: s.basePrice,
          })),
        },
      },
    });

    return NextResponse.json({
      code,
      recipientName,
      buyerName:    `${buyerFirstName} ${buyerLastName}`,
      services:     services.map((s) => s.name),
      totalAmount,
    });
  } catch (err) {
    console.error("[POST /api/gift-cards]", err);
    return NextResponse.json({ error: "Error al crear la gift card" }, { status: 500 });
  }
}
