/**
 * Normaliza un número de WhatsApp argentino a formato +549XXXXXXXXXX
 * Acepta: 3764285491 / 03764285491 / +543764285491 / +54 9 3764 285491 / etc.
 */
export function normalizeWhatsapp(input: string): string {
  let clean = input.replace(/[\s\-\(\)\.]/g, "");

  // Quitar el + al inicio para trabajar solo con dígitos
  if (clean.startsWith("+")) clean = clean.substring(1);

  // Quitar código de país 54
  if (clean.startsWith("54")) clean = clean.substring(2);

  // Quitar 0 de discado nacional
  if (clean.startsWith("0")) clean = clean.substring(1);

  // Agregar el 9 si no está (número móvil argentino)
  if (!clean.startsWith("9")) clean = "9" + clean;

  return "+54" + clean;
}

/**
 * Valida que el número, después de normalizar, tenga el formato correcto:
 * +54 9 + 10 dígitos = 13 dígitos totales (ej: +5493764285491)
 */
export function isValidArgentinePhone(input: string): boolean {
  const normalized = normalizeWhatsapp(input);
  return /^\+549\d{10}$/.test(normalized);
}

/**
 * Formatea para mostrar en pantalla: +54 9 3764-285491
 */
export function formatWhatsappDisplay(normalized: string): string {
  const digits = normalized.replace("+54", "");
  if (digits.length === 11) {
    const area = digits.substring(1, digits.length - 6);
    const number = digits.substring(digits.length - 6);
    return `+54 9 ${area}-${number}`;
  }
  return normalized;
}

/**
 * Genera el link wa.me para enviar un mensaje pre-armado
 */
export function buildWhatsappLink(phone: string, message: string): string {
  const normalized = normalizeWhatsapp(phone);
  const digits = normalized.replace("+", "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
