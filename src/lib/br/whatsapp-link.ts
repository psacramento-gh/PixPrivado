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

/**
 * Returns E.164 digits without "+" (e.g. "551134567890") or null when not a BR landline.
 */
export function normalizeBrazilianLandlineForWhatsApp(raw: string): string | null {
  if (!isBrazilianPhoneNumber(raw)) return null;

  let digits = digitsOnly(raw);
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Legacy 10-digit mobile is handled by mobile normalization.
  if (digits.length === 10 && digits[2] === "9") return null;
  if (digits.length !== 10) return null;

  return `55${digits}`;
}

/** Brazilian display for mobile wa.me E.164 digits: +55 (11) 98765-4321 */
export function formatBrazilianMobileE164(e164: string): string {
  if (!e164.startsWith("55") || e164.length !== 13) {
    return `+${e164}`;
  }
  const ddd = e164.slice(2, 4);
  const num = e164.slice(4);
  return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
}

/** Brazilian display for landline wa.me E.164 digits: +55 (11) 3456-7890 */
export function formatBrazilianLandlineE164(e164: string): string {
  if (!e164.startsWith("55") || e164.length !== 12) {
    return `+${e164}`;
  }
  const ddd = e164.slice(2, 4);
  const num = e164.slice(4);
  return `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
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
    const mobileE164 = normalizeBrazilianMobileForWhatsApp(part);
    if (mobileE164 && !seen.has(mobileE164)) {
      seen.add(mobileE164);
      result.push({
        url: `https://wa.me/${mobileE164}`,
        e164: mobileE164,
        display: formatBrazilianMobileE164(mobileE164),
      });
      continue;
    }

    const landlineE164 = normalizeBrazilianLandlineForWhatsApp(part);
    if (!landlineE164 || seen.has(landlineE164)) continue;
    seen.add(landlineE164);
    result.push({
      url: `https://wa.me/${landlineE164}`,
      e164: landlineE164,
      display: formatBrazilianLandlineE164(landlineE164),
    });
  }

  return result;
}
