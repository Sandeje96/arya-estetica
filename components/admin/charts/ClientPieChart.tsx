"use client";

import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { ClientSegmentData } from "@/lib/reports";

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { label, value } = payload[0].payload;
  return (
    <div className="bg-arya-cream border border-arya-gold/30 rounded-lg px-3 py-2 shadow-md font-sans text-xs">
      <p className="font-semibold text-arya-green-dark">{label}</p>
      <p className="text-arya-text-muted">{value} turno{value !== 1 ? "s" : ""}</p>
    </div>
  );
}

export function ClientPieChart({ data }: { data: ClientSegmentData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 font-sans text-sm text-arya-text-muted">
        Sin datos este mes
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={72}
          paddingAngle={3}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 11 }}
          formatter={(value, entry: any) => {
            const pct = total > 0 ? Math.round((entry.payload.value / total) * 100) : 0;
            return `${value} (${pct}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
