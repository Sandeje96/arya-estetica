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
