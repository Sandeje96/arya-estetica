import type { Metadata } from "next";
import { getAllReportData } from "@/lib/reports";
import { formatPrice } from "@/lib/formatting";
import { MonthlyBarChart }  from "@/components/admin/charts/MonthlyBarChart";
import { CategoryBarChart } from "@/components/admin/charts/CategoryBarChart";
import { ClientPieChart }   from "@/components/admin/charts/ClientPieChart";
import { HeatmapChart }     from "@/components/admin/charts/HeatmapChart";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, Award, Users, XCircle, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Reportes · Admin" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

// ─── Card contenedor de cada sección ─────────────────────────────────────────

function ReportCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
      <div>
        <h2 className="font-heading text-lg font-light text-arya-green-dark">{title}</h2>
        {subtitle && (
          <p className="font-sans text-xs text-arya-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now    = new Date();
  const year   = parseInt(params.year  ?? String(now.getFullYear()), 10);
  const month  = parseInt(params.month ?? String(now.getMonth()),    10);

  const data = await getAllReportData(year, month);

  const monthLabel = format(new Date(year, month, 1), "MMMM yyyy", { locale: es });
  const prevDate   = new Date(year, month - 1, 1);
  const nextDate   = new Date(year, month + 1, 1);
  const isCurrent  = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-light text-arya-green-dark">Reportes</h1>
          <p className="font-sans text-sm text-arya-text-muted mt-0.5">
            Métricas del negocio para tomar mejores decisiones.
          </p>
        </div>
        {/* Navegación de mes */}
        <div className="flex items-center gap-2">
          <a
            href={`?year=${prevDate.getFullYear()}&month=${prevDate.getMonth()}`}
            className="px-3 py-1.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-xs hover:bg-arya-gold/10 transition-colors"
          >←</a>
          <span className="font-sans text-sm font-medium text-arya-text min-w-32 text-center capitalize">
            {monthLabel}
          </span>
          {!isCurrent && (
            <a
              href={`?year=${nextDate.getFullYear()}&month=${nextDate.getMonth()}`}
              className="px-3 py-1.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-xs hover:bg-arya-gold/10 transition-colors"
            >→</a>
          )}
        </div>
      </div>

      {/* ── Fila 1: KPIs rápidos ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Top servicio */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
          <Award size={18} className="text-arya-gold shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider">Más vendido</p>
            <p className="font-sans text-sm font-medium text-arya-text truncate">
              {data.topServices[0]?.name ?? "—"}
            </p>
            <p className="font-sans text-[11px] text-arya-text-muted">
              {data.topServices[0] ? `${data.topServices[0].count} veces` : "Sin datos"}
            </p>
          </div>
        </div>

        {/* Tasa de cancelación */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
          <XCircle size={18} className={data.cancellation.rate > 20 ? "text-destructive shrink-0" : "text-arya-text-muted/50 shrink-0"} aria-hidden />
          <div>
            <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider">Cancelaciones</p>
            <p className="font-heading text-xl font-light text-arya-green-dark">{data.cancellation.rate}%</p>
            <p className="font-sans text-[11px] text-arya-text-muted">
              {data.cancellation.cancelled} de {data.cancellation.total} (3 meses)
            </p>
          </div>
        </div>

        {/* Clientes recurrentes */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
          <Users size={18} className="text-arya-green shrink-0" aria-hidden />
          <div>
            <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider">Recurrentes</p>
            <p className="font-heading text-xl font-light text-arya-green-dark">
              {data.clientSegment.find((s) => s.label === "Recurrentes")?.value ?? 0}
            </p>
            <p className="font-sans text-[11px] text-arya-text-muted capitalize">este {monthLabel}</p>
          </div>
        </div>

        {/* Ingresos del mes */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
          <TrendingUp size={18} className="text-arya-gold shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="font-sans text-[10px] text-arya-text-muted uppercase tracking-wider">Ingresos</p>
            <p className="font-heading text-xl font-light text-arya-green-dark truncate">
              {formatPrice(data.monthly[data.monthly.length - 1]?.ingresos ?? 0)}
            </p>
            <p className="font-sans text-[11px] text-arya-text-muted capitalize">este {monthLabel}</p>
          </div>
        </div>
      </div>

      {/* ── Fila 2: Ingresos vs gastos (6 meses) ─────────────────────────── */}
      <ReportCard
        title="Ingresos vs Gastos"
        subtitle="Últimos 6 meses — en pesos"
      >
        <MonthlyBarChart data={data.monthly} />
      </ReportCard>

      {/* ── Fila 3: Categorías + Clientes ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportCard
          title="Ingresos por categoría"
          subtitle={`Servicios completados en ${monthLabel}`}
        >
          {data.categoryIncome.length === 0 ? (
            <p className="font-sans text-sm text-arya-text-muted py-4 text-center">
              Sin turnos completados este mes
            </p>
          ) : (
            <CategoryBarChart data={data.categoryIncome} />
          )}
        </ReportCard>

        <ReportCard
          title="Clientas nuevas vs recurrentes"
          subtitle={`Turnos completados en ${monthLabel}`}
        >
          <ClientPieChart data={data.clientSegment} />
        </ReportCard>
      </div>

      {/* ── Fila 4: Top servicios ─────────────────────────────────────────── */}
      <ReportCard
        title="Top 5 servicios más vendidos"
        subtitle={`Por cantidad de veces en turnos completados · ${monthLabel}`}
      >
        {data.topServices.length === 0 ? (
          <p className="font-sans text-sm text-arya-text-muted py-2 text-center">
            Sin datos para este mes
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.topServices.map((srv, i) => {
              const maxCount = data.topServices[0].count;
              const pct = Math.round((srv.count / maxCount) * 100);
              return (
                <div key={srv.name} className="flex items-center gap-3">
                  <span className="font-sans text-xs text-arya-text-muted/60 w-4 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-sans text-xs text-arya-text truncate">{srv.name}</span>
                      <span className="font-sans text-xs text-arya-text-muted shrink-0 ml-2">
                        {srv.count}× · {formatPrice(srv.total)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-arya-gold/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-arya-green transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ReportCard>

      {/* ── Fila 5: Heatmap de horarios ───────────────────────────────────── */}
      <ReportCard
        title="Horarios más demandados"
        subtitle="Turnos confirmados y completados en los últimos 3 meses · Lun–Sáb, 8h–18h"
      >
        <HeatmapChart data={data.heatmap} />
      </ReportCard>

    </div>
  );
}
