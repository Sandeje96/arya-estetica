/**
 * Formatea un número como precio en pesos argentinos.
 * Ej: 28000 → "$ 28.000"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
