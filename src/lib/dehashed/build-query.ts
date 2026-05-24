import { classifyPixKey, normalizePhoneForSearch } from "./classify-pix-key";

function escapeNameTerm(value: string): string {
  const trimmed = value.trim();
  if (/\s/.test(trimmed)) {
    return `"${trimmed.replace(/"/g, '\\"')}"`;
  }
  return trimmed;
}

export function buildEmailQuery(email: string): string {
  return `email:${email.trim()}`;
}

export function buildPhoneQuery(raw: string): string {
  return `phone:${normalizePhoneForSearch(raw)}`;
}

export function buildNameQuery(name: string): string {
  return `name:${escapeNameTerm(name)}`;
}

export function buildCpfQuery(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function buildCnpjQuery(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function buildPixKeyQuery(raw: string): string | null {
  const kind = classifyPixKey(raw);
  switch (kind) {
    case "email":
      return buildEmailQuery(raw);
    case "phone":
      return buildPhoneQuery(raw);
    case "cpf":
      return buildCpfQuery(raw);
    case "cnpj":
      return buildCnpjQuery(raw);
    default:
      return null;
  }
}

export function buildMerchantCnpjQuery(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  return buildCnpjQuery(digits);
}

export function buildMerchantNameQuery(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return buildNameQuery(trimmed);
}

/** Allowed queries the API route will forward (abuse guard). */
export function isAllowedDehashedQuery(query: string): boolean {
  if (!query || query.length > 512) return false;
  if (/^email:[^\s&]+@[^\s&]+\.[^\s&]+$/.test(query)) return true;
  if (/^phone:\+?\d{10,15}$/.test(query)) return true;
  if (/^name:(.+)$/.test(query)) return true;
  if (/^\d{11}$/.test(query)) return true;
  if (/^\d{14}$/.test(query)) return true;
  return false;
}
