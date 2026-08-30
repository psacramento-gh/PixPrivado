const REGIONAL_INDICATOR_A = 0x1f1e6;
const LATIN_A = 65;

/** Regional-indicator flag emoji for a valid ISO 3166-1 alpha-2 code. */
export function countryCodeToFlagEmoji(alpha2Code: string): string | null {
  const alpha2 = alpha2Code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(alpha2)) return null;

  return [...alpha2]
    .map((letter) =>
      String.fromCodePoint(REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LATIN_A),
    )
    .join("");
}
