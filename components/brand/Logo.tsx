import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoImage } from "./LogoImage";

interface LogoProps {
  variant?: "default" | "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  showTagline?: boolean;
}

const sizeClasses = {
  sm: { text: "text-2xl",  sub: "text-[9px]",  img: 28 },
  md: { text: "text-3xl",  sub: "text-[10px]", img: 36 },
  lg: { text: "text-4xl",  sub: "text-xs",      img: 44 },
};

const variantClasses = {
  default: { title: "text-arya-green-dark", sub: "text-arya-text-muted" },
  light:   { title: "text-arya-cream",      sub: "text-arya-cream/70" },
  dark:    { title: "text-arya-green-dark", sub: "text-arya-text-muted" },
};

export function Logo({
  variant = "default",
  size = "md",
  className,
  href = "/",
  showTagline = false,
}: LogoProps) {
  const sc = sizeClasses[size];
  const vc = variantClasses[variant];

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Logo imagen — si no existe cae automáticamente y muestra solo el texto */}
      <LogoImage size={sc.img} />

      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading font-light tracking-[0.12em] uppercase",
            sc.text,
            vc.title
          )}
        >
          ARYA
        </span>
        <span
          className={cn(
            "font-sans font-light tracking-[0.28em] uppercase",
            sc.sub,
            vc.sub
          )}
        >
          estética
        </span>
        {showTagline && (
          <span
            className={cn(
              "font-sans font-light tracking-widest uppercase mt-0.5",
              "text-[8px]",
              vc.sub
            )}
          >
            Posadas · Misiones
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="outline-none focus-visible:ring-2 focus-visible:ring-arya-green rounded-sm"
    >
      {content}
    </Link>
  );
}
