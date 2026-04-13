import { cn } from "@/lib/utils";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface LeafDecorationProps {
  position: Position;
  className?: string;
  size?: "sm" | "md" | "lg";
  opacity?: number;
}

const rotations: Record<Position, string> = {
  "top-left":     "rotate-0",
  "top-right":    "rotate-90",
  "bottom-right": "rotate-180",
  "bottom-left":  "-rotate-90",
};

const sizes = {
  sm: 80,
  md: 130,
  lg: 180,
};

export function LeafDecoration({
  position,
  className,
  size = "md",
  opacity = 0.18,
}: LeafDecorationProps) {
  const px = sizes[size];

  return (
    <div
      className={cn("absolute pointer-events-none select-none", rotations[position], className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 130 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rama principal */}
        <path
          d="M10 120 Q40 80 90 20"
          stroke="#4A5D3A"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hoja 1 — grande */}
        <path
          d="M90 20 C110 10 125 30 105 50 C85 70 60 55 90 20Z"
          fill="#6B7F4F"
        />
        <path
          d="M90 20 C97 35 100 45 105 50"
          stroke="#4A5D3A"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hoja 2 — media */}
        <path
          d="M60 55 C75 42 90 52 78 65 C66 78 52 68 60 55Z"
          fill="#8A9B6E"
        />
        <path
          d="M60 55 C68 58 73 62 78 65"
          stroke="#4A5D3A"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hoja 3 — chica */}
        <path
          d="M38 78 C50 68 62 76 52 87 C42 98 32 88 38 78Z"
          fill="#6B7F4F"
        />
        <path
          d="M38 78 C44 81 48 84 52 87"
          stroke="#4A5D3A"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Ramita lateral */}
        <path
          d="M55 65 Q45 58 30 62"
          stroke="#4A5D3A"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30 62 C22 56 22 68 30 66 C38 64 34 58 30 62Z"
          fill="#8A9B6E"
        />
      </svg>
    </div>
  );
}
