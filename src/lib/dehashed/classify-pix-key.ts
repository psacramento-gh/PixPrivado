import { parseIpAddress } from "@/lib/ip/parse-ip";

export type PixKeyKind = "email" | "phone" | "cpf" | "cnpj" | "evp" | "unsupported";

const EVP_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function classifyPixKey(raw: string): PixKeyKind {
  const trimmed = raw.trim();
  if (!trimmed) return "unsupported";

  if (EVP_UUID.test(trimmed)) return "evp";

  if (trimmed.includes("@")) {
    const parts = trimmed.split("@");
    if (parts.length === 2 && parts[0] && parts[1]?.includes(".")) {
      return "email";
    }
    return "unsupported";
  }

  const digits = digitsOnly(trimmed);
  if (digits.length === 11) return "cpf";
  if (digits.length === 14) return "cnpj";

  if (parseIpAddress(trimmed)) return "unsupported";

  if (/^\+?\d[\d\s().-]{8,}$/.test(trimmed)) {
    const phoneDigits = digitsOnly(trimmed);
    if (phoneDigits.length >= 10 && phoneDigits.length <= 15) {
      return "phone";
    }
  }

  return "unsupported";
}

export function normalizePhoneForSearch(raw: string): string {
  const digits = digitsOnly(raw);
  if (digits.startsWith("55") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }
  if (raw.trim().startsWith("+")) return raw.trim();
  return `+${digits}`;
}
