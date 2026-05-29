import { splitCommaSeparatedValues } from "@/lib/age/parse-iso-date";

function isIpv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function isIpv6(value: string): boolean {
  if (!value.includes(":")) return false;
  if (!/^[\da-f:.]+$/i.test(value)) return false;
  const doubleColon = value.split("::");
  if (doubleColon.length > 2) return false;
  const segments = value.split(":").filter((s) => s.length > 0);
  if (segments.length > 8) return false;
  return segments.every((segment) => /^[\da-f]{1,4}$/i.test(segment));
}

/** Returns a normalized IP string when `value` looks like IPv4 or IPv6. */
export function parseIpAddress(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isIpv4(trimmed)) return trimmed;
  if (isIpv6(trimmed)) return trimmed;
  return null;
}

/** Unique IPs from a Dehashed field value (comma-separated arrays). */
export function parseIpAddressesFromValue(rawValue: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of splitCommaSeparatedValues(rawValue)) {
    const ip = parseIpAddress(part);
    if (ip === null || seen.has(ip)) continue;
    seen.add(ip);
    result.push(ip);
  }
  return result;
}

export function isDehashedIpField(field: string): boolean {
  return field === "ip_address" || field === "ip";
}
