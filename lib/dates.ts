/**
 * Utilidades de fecha con zona horaria Argentina (UTC-3, sin DST).
 * Se usan en server components y route handlers donde el servidor corre en UTC.
 */

const TZ = "America/Argentina/Buenos_Aires";

/** Formatea una fecha en hora Argentina — ej: "18:00" */
export function formatTimeAR(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }).format(date);
}

/** Formatea una fecha en formato corto Argentina — ej: "lunes 14/4" */
export function formatDateShortAR(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    weekday:  "long",
    day:      "numeric",
    month:    "numeric",
  }).format(date);
}

/** Devuelve true si la fecha corresponde al día de hoy en Argentina */
export function isTodayAR(date: Date): boolean {
  const ar = new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    year:     "numeric",
    month:    "2-digit",
    day:      "2-digit",
  });
  return ar.format(date) === ar.format(new Date());
}

/** Formatea fecha completa en Argentina — ej: "lunes 14 de abril" */
export function formatDateLongAR(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    weekday:  "long",
    day:      "numeric",
    month:    "long",
  }).format(date);
}

// ─── Período de facturación (10 de cada mes → 9 del siguiente) ───────────────

const MONTH_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

/**
 * Devuelve el período de facturación para un mes dado.
 * month = 0-indexed (0=Enero). El período va del día 10 al día 9 del mes siguiente.
 */
export function getBillingPeriod(year: number, month: number): { from: Date; to: Date } {
  return {
    from: new Date(year, month,     10,  0,  0,  0),
    to:   new Date(year, month + 1,  9, 23, 59, 59),
  };
}

/**
 * Devuelve el año y mes (0-indexed) del período de facturación actual.
 * Si hoy es el 10 o posterior, el período es este mes. Si es antes del 10, es el mes anterior.
 */
export function currentBillingMonth(): { year: number; month: number } {
  const now = new Date();
  if (now.getDate() >= 10) {
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 10);
  return { year: prev.getFullYear(), month: prev.getMonth() };
}

/**
 * Etiqueta legible del período — ej: "10 Abr — 9 May 2026"
 */
export function billingPeriodLabel(year: number, month: number): string {
  const toMonth = month === 11 ? 0 : month + 1;
  const toYear  = month === 11 ? year + 1 : year;
  return `10 ${MONTH_SHORT[month]} — 9 ${MONTH_SHORT[toMonth]} ${toYear}`;
}
