const ALPHA2_RE = /^[A-Z]{2}$/;

/** Regional-indicator flag emoji for a valid ISO 3166-1 alpha-2 code. */
export function countryCodeToFlagEmoji(alpha2: string): string | null {
  const normalized = alpha2.trim().toUpperCase();
  if (!ALPHA2_RE.test(normalized)) return null;

  return String.fromCodePoint(
    ...[...normalized].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}
