import { isBrazilianPhoneNumber } from "./extract-ddd";
import {
  formatBrazilianMobileE164,
  normalizeBrazilianMobileForWhatsApp,
} from "./whatsapp-link";

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
 * Returns E.164 digits without "+" (e.g. "551134567890") or null when not a BR landline.
 */
export function normalizeBrazilianLandlineForTel(raw: string): string | null {
  if (!isBrazilianPhoneNumber(raw)) return null;

  let digits = digitsOnly(raw);
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Legacy 10-digit mobile is handled by WhatsApp normalization, not tel.
  if (digits.length === 10 && digits[2] === "9") return null;
  if (digits.length !== 10) return null;

  return `55${digits}`;
}

/** Brazilian display for landline E.164 digits: +55 (11) 3456-7890 */
export function formatBrazilianLandlineE164(e164: string): string {
  if (!e164.startsWith("55") || e164.length !== 12) {
    return `+${e164}`;
  }
  const ddd = e164.slice(2, 4);
  const num = e164.slice(4);
  return `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
}

export function buildTelUrl(raw: string): string | null {
  const e164 = normalizeBrazilianLandlineForTel(raw);
  return e164 ? `tel:+${e164}` : null;
}

export type PhoneLinkKind = "whatsapp" | "tel";

export type PhoneLink = {
  kind: PhoneLinkKind;
  url: string;
  e164: string;
  display: string;
};

/** Unique phone links from a raw value (WhatsApp for mobile, tel for landline). */
export function getPhoneLinksFromValue(raw: string): PhoneLink[] {
  const seen = new Set<string>();
  const result: PhoneLink[] = [];

  for (const part of splitPhoneListValues(raw.trim())) {
    const mobileE164 = normalizeBrazilianMobileForWhatsApp(part);
    if (mobileE164 && !seen.has(mobileE164)) {
      seen.add(mobileE164);
      result.push({
        kind: "whatsapp",
        url: `https://wa.me/${mobileE164}`,
        e164: mobileE164,
        display: formatBrazilianMobileE164(mobileE164),
      });
      continue;
    }

    const landlineE164 = normalizeBrazilianLandlineForTel(part);
    if (landlineE164 && !seen.has(landlineE164)) {
      seen.add(landlineE164);
      result.push({
        kind: "tel",
        url: `tel:+${landlineE164}`,
        e164: landlineE164,
        display: formatBrazilianLandlineE164(landlineE164),
      });
    }
  }

  return result;
}
