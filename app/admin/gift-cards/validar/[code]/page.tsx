import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ValidarGiftCardClient } from "@/components/admin/ValidarGiftCardClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata: Metadata = { title: "Validar Gift Card · Admin" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ValidarGiftCardPage({ params }: PageProps) {
  const { code } = await params;

  const giftCard = await db.giftCard.findUnique({
    where: { code },
    include: {
      buyer:  { select: { firstName: true, lastName: true, whatsapp: true } },
      items:  { include: { service: { select: { name: true } } } },
    },
  });

  if (!giftCard) notFound();

  const data = {
    code:           giftCard.code,
    recipientName:  giftCard.recipientName,
    buyerName:      `${giftCard.buyer.firstName} ${giftCard.buyer.lastName}`,
    buyerWhatsapp:  giftCard.buyer.whatsapp,
    totalAmount:    giftCard.totalAmount,
    status:         giftCard.status,
    createdAt:      format(giftCard.createdAt, "d 'de' MMMM yyyy", { locale: es }),
    redeemedAt:     giftCard.redeemedAt
      ? format(giftCard.redeemedAt, "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })
      : null,
    services:       giftCard.items.map((i) => ({
      name:  i.service.name,
      price: i.priceAtPurchase,
    })),
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-light text-arya-green-dark">
          Validar Gift Card
        </h1>
        <p className="font-sans text-sm text-arya-text-muted mt-0.5 font-mono tracking-wider">
          {code}
        </p>
      </div>

      <ValidarGiftCardClient data={data} />
    </div>
  );
}
