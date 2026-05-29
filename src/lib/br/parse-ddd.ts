/** Parses a standalone 2-digit Brazilian area code (10–99). */
export function parseDddValue(raw: string): number | null {
  const digits = raw.trim().replace(/\D/g, "");
  if (digits.length !== 2) return null;

  const ddd = Number.parseInt(digits, 10);
  if (!Number.isFinite(ddd) || ddd < 10 || ddd > 99) return null;

  return ddd;
}
