/** Normalizes a CNAE subclass value to seven digits, or null when invalid. */
export function parseCnaeDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 7) return null;
  return digits;
}
