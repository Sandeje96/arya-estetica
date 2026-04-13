import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "./Logo";

function InstagramIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-arya-green-dark text-arya-cream/90">
      {/* Separador dorado */}
      <div className="h-px bg-gradient-to-r from-transparent via-arya-gold/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Columna 1 — Logo + descripción */}
          <div className="flex flex-col gap-4">
            <Logo variant="light" size="sm" href="/" />
            <p className="font-sans text-sm text-arya-cream/60 leading-relaxed max-w-xs">
              Centro de estética premium en el corazón de Posadas. Tratamientos capilares, corporales y faciales en un ambiente cálido y profesional.
            </p>
          </div>

          {/* Columna 2 — Contacto */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-lg font-light tracking-wider text-arya-cream">
              Contacto
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-arya-gold" aria-hidden />
                <address className="not-italic font-sans text-sm text-arya-cream/70 leading-relaxed">
                  Edificio Puerta Real, Dpto 12 E<br />
                  Villa Sarita, Posadas, Misiones
                </address>
              </li>
              <li>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? "5493764285491"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                  aria-label="Escribinos por WhatsApp"
                >
                  <Phone size={15} className="shrink-0 text-arya-gold" aria-hidden />
                  <span className="font-sans text-sm text-arya-cream/70 group-hover:text-arya-cream transition-colors">
                    +54 9 3764-285491
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:arya.estetica.1@gmail.com"
                  className="flex items-center gap-3 group"
                >
                  <Mail size={15} className="shrink-0 text-arya-gold" aria-hidden />
                  <span className="font-sans text-sm text-arya-cream/70 group-hover:text-arya-cream transition-colors">
                    arya.estetica.1@gmail.com
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3 — Links + redes */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-lg font-light tracking-wider text-arya-cream">
              Seguinos
            </h3>
            <a
              href="https://instagram.com/arya_estetica"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group w-fit"
              aria-label="Instagram de Arya Estética"
            >
              <InstagramIcon size={15} className="text-arya-gold" />
              <span className="font-sans text-sm text-arya-cream/70 group-hover:text-arya-cream transition-colors">
                @arya_estetica
              </span>
            </a>

            <div className="mt-2 flex flex-col gap-2">
              <h4 className="font-sans text-xs text-arya-cream/40 uppercase tracking-widest">
                Navegación
              </h4>
              {[
                { href: "/servicios", label: "Servicios" },
                { href: "/reservar", label: "Reservar turno" },
                { href: "/gift-card", label: "Gift Cards" },
                { href: "/jornada-depilacion", label: "Jornada láser" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-sans text-sm text-arya-cream/60 hover:text-arya-cream transition-colors w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-arya-cream/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-sans text-xs text-arya-cream/30">
            © {new Date().getFullYear()} Arya Estética. Todos los derechos reservados.
          </p>
          <p className="font-sans text-xs text-arya-cream/20">
            Posadas, Misiones, Argentina
          </p>
        </div>
      </div>
    </footer>
  );
}
