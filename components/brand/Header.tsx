"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/servicios", label: "Servicios" },
  { href: "/gift-card", label: "Gift Card" },
  { href: "/jornada-depilacion", label: "Jornada láser" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-arya-cream-light/95 backdrop-blur-sm border-b border-arya-gold/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Logo size="sm" />

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm text-arya-text-muted hover:text-arya-green-dark transition-colors tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center">
          <Link
            href="/reservar"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-arya-green-dark text-arya-cream-light font-sans text-sm font-medium tracking-wide hover:bg-arya-green transition-colors shadow-sm"
          >
            Reservar turno
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden p-2 -mr-2 text-arya-green-dark rounded-md"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú mobile */}
      <div
        className={cn(
          "md:hidden border-t border-arya-gold/20 bg-arya-cream-light overflow-hidden transition-all duration-200",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="flex flex-col px-4 py-4 gap-1" aria-label="Navegación mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-sans text-sm text-arya-text py-3 border-b border-arya-gold/15 last:border-0 hover:text-arya-green-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reservar"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center px-5 py-3 rounded-md bg-arya-green-dark text-arya-cream-light font-sans text-sm font-medium tracking-wide"
          >
            Reservar turno
          </Link>
        </nav>
      </div>
    </header>
  );
}
