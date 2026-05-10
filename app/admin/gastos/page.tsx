import type { Metadata } from "next";
import { db } from "@/lib/db";
import { GastosClient, type ExpenseRow } from "@/components/admin/GastosClient";
import { getBillingPeriod, currentBillingMonth, billingPeriodLabel } from "@/lib/dates";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata: Metadata = { title: "Gastos · Admin" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

async function getExpenses(year: number, month: number) {
  const { from, to } = getBillingPeriod(year, month);

  try {
    const rows = await db.expense.findMany({
      where:   { date: { gte: from, lte: to } },
      orderBy: { date: "desc" },
    });

    return rows.map((e): ExpenseRow => ({
      id:          e.id,
      amount:      e.amount,
      category:    e.category,
      description: e.description,
      date:        e.date.toISOString(),
      dateLabel:   format(e.date, "d MMM yyyy", { locale: es }),
    }));
  } catch {
    return [];
  }
}

export default async function GastosPage({ searchParams }: PageProps) {
  const params   = await searchParams;
  const billing  = currentBillingMonth();
  const year     = parseInt(params.year  ?? String(billing.year),  10);
  const month    = parseInt(params.month ?? String(billing.month), 10);

  const expenses   = await getExpenses(year, month);
  const totalMonth = expenses.reduce((s, e) => s + e.amount, 0);
  const periodLabel = billingPeriodLabel(year, month);

  // Navegación entre períodos
  const prevDate       = new Date(year, month - 1, 10);
  const nextDate       = new Date(year, month + 1, 10);
  const isCurrentMonth = year === billing.year && month === billing.month;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-light text-arya-green-dark">Gastos</h1>
          <p className="font-sans text-sm text-arya-text-muted mt-0.5">
            Registrá y revisá todos los egresos del negocio.
          </p>
        </div>

        {/* Navegación de período */}
        <div className="flex items-center gap-2">
          <a
            href={`?year=${prevDate.getFullYear()}&month=${prevDate.getMonth()}`}
            className="px-3 py-1.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-xs hover:bg-arya-gold/10 transition-colors"
          >←</a>
          <span className="font-sans text-sm font-medium text-arya-text px-2 min-w-40 text-center">
            {periodLabel}
          </span>
          {!isCurrentMonth && (
            <a
              href={`?year=${nextDate.getFullYear()}&month=${nextDate.getMonth()}`}
              className="px-3 py-1.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-xs hover:bg-arya-gold/10 transition-colors"
            >→</a>
          )}
        </div>
      </div>

      <GastosClient
        expenses={expenses}
        totalMonth={totalMonth}
        currentMonth={periodLabel}
      />
    </div>
  );
}
