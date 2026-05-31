import { isBrazilianPhoneNumber } from "./extract-ddd";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Splits list values (comma, semicolon, pipe, or newline). */
function splitPhoneListValues(value: string): string[] {
  if (!/[,;|\n\r]/.test(value)) return [value];
  return value
    .split(/[,;|\n\r]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Returns E.164 digits without "+" (e.g. "5511987654321") or null when not a BR mobile.
 */
export function normalizeBrazilianMobileForWhatsApp(raw: string): string | null {
  if (!isBrazilianPhoneNumber(raw)) return null;

  let digits = digitsOnly(raw);
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Legacy 10-digit mobile (DDD + 9xxxxxxxx) → insert extra 9 after DDD.
  if (digits.length === 10 && digits[2] === "9") {
    digits = `${digits.slice(0, 2)}9${digits.slice(2)}`;
  }

  if (digits.length !== 11 || digits[2] !== "9") return null;

  return `55${digits}`;
}

/** Brazilian display for wa.me E.164 digits: +55 (11) 98765-4321 */
export function formatBrazilianMobileE164(e164: string): string {
  if (!e164.startsWith("55") || e164.length !== 13) {
    return `+${e164}`;
  }
  const ddd = e164.slice(2, 4);
  const num = e164.slice(4);
  return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
}

export function buildWhatsAppUrl(raw: string): string | null {
  const e164 = normalizeBrazilianMobileForWhatsApp(raw);
  return e164 ? `https://wa.me/${e164}` : null;
}

export type WhatsAppLink = {
  url: string;
  e164: string;
  display: string;
};

/** Unique WhatsApp links from a raw value (supports comma-separated lists). */
export function getWhatsAppLinksFromValue(raw: string): WhatsAppLink[] {
  const seen = new Set<string>();
  const result: WhatsAppLink[] = [];

  for (const part of splitPhoneListValues(raw.trim())) {
    const e164 = normalizeBrazilianMobileForWhatsApp(part);
    if (!e164 || seen.has(e164)) continue;
    seen.add(e164);
    result.push({
      url: `https://wa.me/${e164}`,
      e164,
      display: formatBrazilianMobileE164(e164),
    });
  }

  return result;
}
