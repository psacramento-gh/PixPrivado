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

function ipv4FromDecimal(value: string): string | null {
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0 || n > 0xffff_ffff) return null;
  const ip = [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join(".");
  return isIpv4(ip) ? ip : null;
}

/** Strips common wrappers (brackets, zone id, port, CIDR) before validation. */
function normalizeIpCandidate(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;

  if (value.startsWith("[") && value.endsWith("]")) {
    value = value.slice(1, -1).trim();
  }

  const zoneIndex = value.indexOf("%");
  if (zoneIndex !== -1) {
    value = value.slice(0, zoneIndex).trim();
  }

  const cidrIndex = value.indexOf("/");
  if (cidrIndex !== -1) {
    value = value.slice(0, cidrIndex).trim();
  }

  const v4Mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(value);
  if (v4Mapped) {
    value = v4Mapped[1];
  }

  const colonCount = (value.match(/:/g) ?? []).length;
  if (colonCount === 1) {
    const withPort = /^(\d{1,3}(?:\.\d{1,3}){3}):(\d{1,5})$/.exec(value);
    if (withPort) {
      value = withPort[1];
    }
  }

  if (isIpv4(value)) return value;
  if (isIpv6(value)) return value;

  return ipv4FromDecimal(value);
}

/** Returns a normalized IP string when `value` looks like IPv4 or IPv6. */
export function parseIpAddress(value: string): string | null {
  return normalizeIpCandidate(value);
}

/** Splits Dehashed list values (comma, semicolon, pipe, or newline). */
export function splitIpListValues(value: string): string[] {
  if (!/[,;|\n\r]/.test(value)) return [value];
  return value
    .split(/[,;|\n\r]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Unique IPs from a Dehashed field value (comma-separated arrays). */
export function parseIpAddressesFromValue(rawValue: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of splitIpListValues(rawValue)) {
    const ip = parseIpAddress(part);
    if (ip === null || seen.has(ip)) continue;
    seen.add(ip);
    result.push(ip);
  }
  return result;
}

export function isDehashedPhoneField(field: string): boolean {
  const normalized = field.toLowerCase().replace(/-/g, "_");
  if (normalized === "phone" || normalized === "phones") {
    return true;
  }
  return normalized.endsWith("_phone") && !normalized.includes("iphone");
}

export function isDehashedIpField(field: string): boolean {
  const normalized = field.toLowerCase().replace(/-/g, "_");
  if (
    normalized === "ip" ||
    normalized === "ip_address" ||
    normalized === "ip_addresses" ||
    normalized === "ipaddress"
  ) {
    return true;
  }
  if (normalized.endsWith("_ip") || normalized.endsWith("_ip_address")) {
    return true;
  }
  return false;
}
