/** Returns 8-digit CEP or null when the value is not a valid Brazilian postal code. */
export function parseCepDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  return digits;
}

export function formatCepDigits(digits: string): string {
  const normalized = digits.replace(/\D/g, "");
  if (normalized.length !== 8) return digits;
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}
