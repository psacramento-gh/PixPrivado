/** Normalizes city names for accent-insensitive comparison (EMV often omits accents). */
export function normalizeCityForMatch(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

export const MIN_CITY_QUERY_LENGTH = 2;

export function parseMerchantCityQuery(raw: string): string | null {
  const normalized = normalizeCityForMatch(raw);
  if (normalized.length < MIN_CITY_QUERY_LENGTH) {
    return null;
  }
  return normalized;
}

export function parseBrazilianUfParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const uf = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(uf) ? uf : null;
}
