"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { CategoryIncomeData } from "@/lib/reports";
import { formatPrice } from "@/lib/formatting";

const COLORS = ["#4A5D3A","#6B7F4F","#8A9B6E","#B8A668","#C8B97E","#4A5D3A","#6B7F4F","#8A9B6E"];

function CurrencyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-arya-cream border border-arya-gold/30 rounded-lg px-3 py-2 shadow-md font-sans text-xs">
      <p className="font-semibold text-arya-green-dark">{payload[0].payload.category}</p>
      <p className="text-arya-text-muted">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

export function CategoryBarChart({ data }: { data: CategoryIncomeData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        barSize={12}
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#B8A66820" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 10, fill: "#6B6B6B" }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={110}
          tick={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 10, fill: "#3D3D3D" }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: "#B8A66810" }} />
        <Bar dataKey="total" radius={[0, 3, 3, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
