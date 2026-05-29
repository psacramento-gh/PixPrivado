import { parseIpAddress } from "@/lib/ip/parse-ip";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** True when the value looks like a Brazilian number (country 55 or local 10–11 digits). */
export function isBrazilianPhoneNumber(raw: string): boolean {
  const trimmed = raw.trim();
  if (parseIpAddress(trimmed)) return false;

  const digits = digitsOnly(trimmed);

  if (trimmed.startsWith("+55") || trimmed.startsWith("55 ")) return true;
  if (digits.startsWith("55") && digits.length >= 12 && digits.length <= 13) {
    return true;
  }
  if (digits.length === 10 || digits.length === 11) {
    return !digits.startsWith("55");
  }
  return false;
}

/**
 * Extracts the 2-digit DDD from a Brazilian phone string.
 * Returns null when the number is not Brazilian or DDD cannot be determined.
 */
export function extractDddFromPhone(raw: string): number | null {
  if (!isBrazilianPhoneNumber(raw)) return null;

  const digits = digitsOnly(raw);
  let national: string;

  if (digits.startsWith("55") && digits.length >= 12) {
    national = digits.slice(2);
  } else if (digits.length === 10 || digits.length === 11) {
    national = digits;
  } else {
    return null;
  }

  if (national.length < 10) return null;

  const ddd = Number.parseInt(national.slice(0, 2), 10);
  if (!Number.isFinite(ddd) || ddd < 10 || ddd > 99) return null;

  return ddd;
}
