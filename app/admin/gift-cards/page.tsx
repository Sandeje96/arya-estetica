import type { Metadata } from "next";
import { db } from "@/lib/db";
import { GiftCardsClient, type GiftCardRow } from "@/components/admin/GiftCardsClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata: Metadata = { title: "Gift Cards · Admin" };
export const dynamic = "force-dynamic";

async function getGiftCards(): Promise<GiftCardRow[]> {
  try {
    const rows = await db.giftCard.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { firstName: true, lastName: true } },
        _count: { select: { items: true } },
      },
    });

    return rows.map((r) => ({
      id:            r.id,
      code:          r.code,
      recipientName: r.recipientName,
      buyerName:     `${r.buyer.firstName} ${r.buyer.lastName}`,
      totalAmount:   r.totalAmount,
      status:        r.status,
      createdAt:     format(r.createdAt, "d MMM yyyy", { locale: es }),
      serviceCount:  r._count.items,
    }));
  } catch {
    return [];
  }
}

export default async function GiftCardsPage() {
  const giftCards = await getGiftCards();

  const pendingCount = giftCards.filter((g) => g.status === "PENDING_PICKUP").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-light text-arya-green-dark">Gift Cards</h1>
        <p className="font-sans text-sm text-arya-text-muted mt-0.5">
          Gestión de gift cards: descargá el PDF, imprimilas y validalas por QR cuando la clienta las use.
        </p>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
          <span className="font-sans text-sm text-amber-700">
            Tenés <strong>{pendingCount}</strong> gift card{pendingCount !== 1 ? "s" : ""} pendiente{pendingCount !== 1 ? "s" : ""} de entrega.
            Descargá el PDF, imprimí la tarjeta y marcala como "Lista" cuando la entregues.
          </span>
        </div>
      )}

      <GiftCardsClient giftCards={giftCards} />
    </div>
  );
}
