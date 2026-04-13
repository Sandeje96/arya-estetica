"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { MonthlyBarData } from "@/lib/reports";
import { formatPrice } from "@/lib/formatting";

function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-arya-cream border border-arya-gold/30 rounded-lg px-3 py-2 shadow-md font-sans text-xs">
      <p className="font-semibold text-arya-green-dark mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatPrice(p.value)}
        </p>
      ))}
    </div>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyBarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barSize={14} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#B8A66820" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11, fill: "#6B6B6B" }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 10, fill: "#6B6B6B" }}
          axisLine={false} tickLine={false} width={44}
        />
        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: "#B8A66810" }} />
        <Legend
          wrapperStyle={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11, paddingTop: 8 }}
        />
        <Bar dataKey="ingresos" name="Ingresos" fill="#6B7F4F" radius={[3, 3, 0, 0]} />
        <Bar dataKey="gastos"   name="Gastos"   fill="#B8A668" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
