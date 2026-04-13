"use client";

import type { HeatmapCell } from "@/lib/reports";
import { cn } from "@/lib/utils";

const DAY_LABELS  = ["Lun","Mar","Mié","Jue","Vie","Sáb"];
const HOUR_LABELS = Array.from({ length: 11 }, (_, i) => `${8 + i}h`);

function intensity(count: number, max: number): string {
  if (max === 0 || count === 0) return "bg-arya-gold/5 text-arya-text-muted/30";
  const ratio = count / max;
  if (ratio < 0.2)  return "bg-arya-green/10 text-arya-green-dark/40";
  if (ratio < 0.4)  return "bg-arya-green/25 text-arya-green-dark/60";
  if (ratio < 0.6)  return "bg-arya-green/45 text-arya-green-dark";
  if (ratio < 0.8)  return "bg-arya-green/65 text-arya-cream/80";
  return "bg-arya-green-dark text-arya-cream";
}

export function HeatmapChart({ data }: { data: HeatmapCell[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  // Organizar en grid [day][hour]
  const grid: Record<number, Record<number, number>> = {};
  for (const cell of data) {
    if (!grid[cell.day]) grid[cell.day] = {};
    grid[cell.day][cell.hour] = cell.count;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        {/* Cabecera de horas */}
        <div className="flex items-center gap-1 mb-1 pl-10">
          {HOUR_LABELS.map((h) => (
            <div key={h} className="flex-1 text-center font-sans text-[10px] text-arya-text-muted">
              {h}
            </div>
          ))}
        </div>

        {/* Filas por día */}
        {[1, 2, 3, 4, 5, 6].map((day, di) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <div className="w-9 shrink-0 font-sans text-[11px] text-arya-text-muted text-right pr-2">
              {DAY_LABELS[di]}
            </div>
            {Array.from({ length: 11 }, (_, i) => 8 + i).map((hour) => {
              const count = grid[day]?.[hour] ?? 0;
              return (
                <div
                  key={hour}
                  className={cn(
                    "flex-1 aspect-square rounded-sm flex items-center justify-center font-sans text-[9px] font-medium transition-colors",
                    intensity(count, max)
                  )}
                  title={`${DAY_LABELS[di]} ${hour}:00 — ${count} turno${count !== 1 ? "s" : ""}`}
                >
                  {count > 0 ? count : ""}
                </div>
              );
            })}
          </div>
        ))}

        {/* Leyenda */}
        <div className="flex items-center gap-2 mt-3 pl-10">
          <span className="font-sans text-[10px] text-arya-text-muted">Menos</span>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
            <div
              key={i}
              className={cn("w-4 h-4 rounded-sm", intensity(Math.round(ratio * max), max))}
            />
          ))}
          <span className="font-sans text-[10px] text-arya-text-muted">Más</span>
        </div>
      </div>
    </div>
  );
}
