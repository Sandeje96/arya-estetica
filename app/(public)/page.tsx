import Link from "next/link";
import { ArrowRight, Sparkles, Gift, Leaf, Star, Zap } from "lucide-react";
import { LeafDecoration } from "@/components/brand/LeafDecoration";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── Datos de preview de categorías ─────────────────────────────────────────

const serviceHighlights = [
  {
    icon: "✂️",
    title: "Tratamientos capilares",
    description: "Botox, keratina, laminado y más. Dale vida y brillo a tu cabello.",
    href: "/servicios#capilar",
  },
  {
    icon: "💅",
    title: "Uñas",
    description: "Manicura y pedicura rusas, capping, soft gel y diseños únicos.",
    href: "/servicios#manos",
  },
  {
    icon: "🌿",
    title: "Masoterapia",
    description: "Masajes relajantes, descontracturantes y drenaje linfático.",
    href: "/servicios#masoterapia",
  },
  {
    icon: "✨",
    title: "Cosmetología",
    description: "Limpieza facial profunda, tratamientos y dermaplaning.",
    href: "/servicios#cosmetologia",
  },
  {
    icon: "💫",
    title: "Maquillaje",
    description: "Social y blindado para lucir perfecta en cada ocasión.",
    href: "/servicios#maquillaje",
  },
  {
    icon: "🔆",
    title: "Depilación láser",
    description: "Soprano Ice Titanium. Jornadas mensuales con turnos limitados.",
    href: "/jornada-depilacion",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  // Jornada activa para el banner
  let activeLaserDay: { date: Date; slots: number; booked: number } | null = null;
  try {
    const raw = await db.laserDay.findFirst({
      where:   { active: true, date: { gt: new Date() } },
      orderBy: { date: "asc" },
      include: { _count: { select: { appointments: true } } },
    });
    if (raw) activeLaserDay = { date: raw.date, slots: raw.slots, booked: raw._count.appointments };
  } catch { /* sin DB en dev → se ignora */ }

  return (
    <div className="flex flex-col">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-arya-cream min-h-[85svh] flex items-center">
        {/* Decoraciones */}
        <LeafDecoration position="top-left"     size="lg" className="top-0 left-0"  />
        <LeafDecoration position="top-right"    size="md" className="top-0 right-0" />
        <LeafDecoration position="bottom-right" size="lg" className="bottom-0 right-0" opacity={0.12} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center gap-8">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-arya-gold">
            <div className="h-px w-10 bg-arya-gold/50" />
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-arya-gold">
              Centro de Estética — Posadas
            </span>
            <div className="h-px w-10 bg-arya-gold/50" />
          </div>

          {/* Título principal */}
          <h1 className="font-heading font-light text-5xl sm:text-6xl md:text-7xl text-arya-green-dark leading-tight max-w-3xl">
            Tu mejor versión,
            <br />
            <em className="not-italic text-arya-green">en cada visita</em>
          </h1>

          {/* Subtítulo */}
          <p className="font-sans text-base sm:text-lg text-arya-text-muted max-w-xl leading-relaxed">
            Tratamientos capilares, uñas, masajes, cosmetología y depilación láser.
            Un espacio cálido y profesional pensado especialmente para vos.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/reservar"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-md bg-arya-green-dark text-arya-cream-light font-sans font-medium text-sm tracking-wide hover:bg-arya-green transition-colors shadow-sm"
            >
              Reservar turno
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/servicios"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-md border border-arya-gold/50 text-arya-green-dark font-sans font-medium text-sm tracking-wide hover:bg-arya-gold/10 transition-colors"
            >
              Ver servicios
            </Link>
          </div>

          {/* Social proof mini */}
          <div className="flex items-center gap-1.5 text-arya-gold mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" aria-hidden />
            ))}
            <span className="font-sans text-xs text-arya-text-muted ml-1">
              Posadas confía en Arya Estética
            </span>
          </div>
        </div>
      </section>

      {/* ── Banner jornada láser (solo cuando hay una activa) ───────────────── */}
      {activeLaserDay && (
        <section className="bg-arya-green-dark py-4 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-arya-cream">
              <Zap size={16} className="text-arya-gold shrink-0" aria-hidden />
              <p className="font-sans text-sm">
                <strong>Jornada de depilación láser</strong> ·{" "}
                {format(activeLaserDay.date, "EEEE d 'de' MMMM", { locale: es })} ·{" "}
                <span className="text-arya-cream/70">
                  {Math.max(activeLaserDay.slots - activeLaserDay.booked, 0)} cupos disponibles
                </span>
              </p>
            </div>
            <Link
              href="/jornada-depilacion"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-md bg-arya-gold text-arya-green-dark font-sans text-xs font-semibold hover:bg-arya-gold-soft transition-colors"
            >
              Reservar lugar
              <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {/* ── Franja dorada separadora ────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-arya-gold/40 to-transparent" />

      {/* ── Servicios destacados ────────────────────────────────────────────── */}
      <section className="relative bg-arya-cream-light py-20 px-4 sm:px-6 overflow-hidden">
        <LeafDecoration position="bottom-left" size="lg" className="bottom-0 left-0" opacity={0.1} />

        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          {/* Encabezado sección */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-arya-gold">
              <div className="h-px w-8 bg-arya-gold/40" />
              <Sparkles size={14} aria-hidden />
              <div className="h-px w-8 bg-arya-gold/40" />
            </div>
            <h2 className="font-heading font-light text-4xl text-arya-green-dark">
              Nuestros servicios
            </h2>
            <p className="font-sans text-sm text-arya-text-muted max-w-md">
              Elegí uno o combiná varios para una experiencia completa.
              El turno es tuyo cuando vos quieras.
            </p>
          </div>

          {/* Grid de categorías */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceHighlights.map((svc) => (
              <Link
                key={svc.href}
                href={svc.href}
                className="group flex flex-col gap-3 p-6 rounded-lg bg-arya-cream border border-arya-gold/25 hover:border-arya-gold/60 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="text-3xl" aria-hidden>{svc.icon}</span>
                <h3 className="font-heading text-xl font-light text-arya-green-dark group-hover:text-arya-green transition-colors">
                  {svc.title}
                </h3>
                <p className="font-sans text-sm text-arya-text-muted leading-relaxed flex-1">
                  {svc.description}
                </p>
                <span className="font-sans text-xs text-arya-green-soft font-medium flex items-center gap-1 mt-1">
                  Ver más <ArrowRight size={12} aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/servicios"
              className="flex items-center gap-2 px-7 py-3 rounded-md border border-arya-green-dark/30 text-arya-green-dark font-sans text-sm font-medium tracking-wide hover:bg-arya-green-dark hover:text-arya-cream transition-colors"
            >
              Ver todos los servicios
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Franja separadora ───────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-arya-gold/30 to-transparent" />

      {/* ── Gift Card promo ─────────────────────────────────────────────────── */}
      <section className="relative bg-arya-cream py-16 px-4 sm:px-6 overflow-hidden">
        <LeafDecoration position="top-right" size="md" className="top-0 right-4" opacity={0.13} />

        <div className="max-w-4xl mx-auto">
          <div className="relative flex flex-col md:flex-row items-center gap-10 p-8 sm:p-12 rounded-2xl border border-arya-gold/40 bg-gradient-to-br from-arya-cream-light to-arya-cream overflow-hidden">
            {/* Detalle dorado esquina */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-arya-gold/5 rounded-br-full" aria-hidden />

            <div className="flex-1 flex flex-col gap-4 text-center md:text-left relative z-10">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Gift size={16} className="text-arya-gold" aria-hidden />
                <span className="font-sans text-xs tracking-[0.25em] uppercase text-arya-gold">
                  Regalá bienestar
                </span>
              </div>
              <h2 className="font-heading font-light text-4xl text-arya-green-dark">
                Gift Cards de Arya
              </h2>
              <p className="font-sans text-sm text-arya-text-muted leading-relaxed">
                El regalo perfecto para alguien especial. Elegís los servicios,
                nosotras preparamos una tarjeta preciosa para entregar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mt-2">
                <Link
                  href="/gift-card"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-arya-green-dark text-arya-cream-light font-sans text-sm font-medium tracking-wide hover:bg-arya-green transition-colors shadow-sm"
                >
                  Comprar gift card
                  <Gift size={14} aria-hidden />
                </Link>
              </div>
            </div>

            {/* Visual decorativo */}
            <div className="hidden md:flex shrink-0 w-36 h-36 rounded-full bg-arya-gold/10 border border-arya-gold/30 items-center justify-center relative z-10">
              <Gift size={48} className="text-arya-gold/60" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores / Por qué Arya ───────────────────────────────────────────── */}
      <section className="bg-arya-green-dark text-arya-cream py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Leaf size={18} className="text-arya-gold/70" aria-hidden />
            <h2 className="font-heading font-light text-3xl sm:text-4xl text-arya-cream">
              Un espacio pensado para vos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
            {[
              {
                title: "Productos de calidad",
                body: "Trabajamos con marcas premium y productos libres de componentes agresivos para el cabello y la piel.",
              },
              {
                title: "Atención personalizada",
                body: "Cada clienta es única. Escuchamos lo que necesitás y adaptamos cada tratamiento a vos.",
              },
              {
                title: "Ambiente cálido",
                body: "Un espacio tranquilo, limpio y acogedor donde podés relajarte y desconectarte.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-3 text-center">
                <div className="mx-auto w-10 h-px bg-arya-gold/50" aria-hidden />
                <h3 className="font-heading text-xl font-light text-arya-cream">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-arya-cream/60 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────────── */}
      <section className="relative bg-arya-cream py-20 px-4 sm:px-6 overflow-hidden">
        <LeafDecoration position="bottom-left"  size="md" className="bottom-0 left-0"  opacity={0.15} />
        <LeafDecoration position="bottom-right" size="sm" className="bottom-0 right-0" opacity={0.1} />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6 text-center">
          <h2 className="font-heading font-light text-4xl sm:text-5xl text-arya-green-dark">
            ¿Lista para tu próxima visita?
          </h2>
          <p className="font-sans text-sm sm:text-base text-arya-text-muted max-w-md leading-relaxed">
            Contanos qué servicios te interesan y nos ponemos en contacto para coordinar el mejor momento para vos.
          </p>
          <Link
            href="/reservar"
            className="flex items-center gap-2 px-8 py-4 rounded-md bg-arya-green-dark text-arya-cream-light font-sans font-medium tracking-wide hover:bg-arya-green transition-colors shadow-sm text-sm"
          >
            Pedir turno ahora
            <ArrowRight size={16} aria-hidden />
          </Link>
          <a
            href="https://wa.me/5493764285491?text=Hola!%20Me%20gustar%C3%ADa%20pedir%20turno%20en%20Arya%20Est%C3%A9tica."
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-arya-text-muted hover:text-arya-green-dark transition-colors underline underline-offset-4"
          >
            O escribinos directo por WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
