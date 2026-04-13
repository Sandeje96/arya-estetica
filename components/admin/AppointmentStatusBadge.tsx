import { cn } from "@/lib/utils";

type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const config: Record<Status, { label: string; className: string }> = {
  PENDING:   { label: "Pendiente",   className: "bg-arya-gold/15 text-amber-700 border-arya-gold/30" },
  CONFIRMED: { label: "Confirmado",  className: "bg-arya-green/15 text-arya-green-dark border-arya-green-soft/30" },
  COMPLETED: { label: "Completado",  className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Cancelado",   className: "bg-gray-100 text-gray-500 border-gray-200" },
};

export function AppointmentStatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status] ?? config.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-sans font-medium border",
        className
      )}
    >
      {label}
    </span>
  );
}
