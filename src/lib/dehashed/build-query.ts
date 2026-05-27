import { classifyPixKey, normalizePhoneForSearch } from "./classify-pix-key";

/** Quote multi-word values for Dehashed exact-phrase matching. */
function escapePhraseTerm(value: string): string {
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
  return `name:${escapePhraseTerm(name)}`;
}

/** Search across all Dehashed fields (web UI “All” category). */
export function buildAllFieldsPhraseQuery(value: string): string {
  return escapePhraseTerm(value.trim());
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

/**
 * EMV tag 59 (Merchant Name): mostly display names, but may hold CPF/CNPJ,
 * email, or phone. Names use all-fields phrase search; clear identifiers use
 * the same field-specific queries as PIX key (01).
 */
export function buildMerchantNameQuery(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const identifierQuery = buildPixKeyQuery(trimmed);
  if (identifierQuery) return identifierQuery;

  return buildAllFieldsPhraseQuery(trimmed);
}

function isAllowedAllFieldsPhraseQuery(query: string): boolean {
  if (/^"[^"]{1,500}"$/.test(query)) return true;
  if (/^[^\s"\\]{2,200}$/.test(query)) return true;
  return false;
}

/** Allowed queries the API route will forward (abuse guard). */
export function isAllowedDehashedQuery(query: string): boolean {
  if (!query || query.length > 512) return false;
  if (/^email:[^\s&]+@[^\s&]+\.[^\s&]+$/.test(query)) return true;
  if (/^phone:\+?\d{10,15}$/.test(query)) return true;
  if (/^name:(.+)$/.test(query)) return true;
  if (/^\d{11}$/.test(query)) return true;
  if (/^\d{14}$/.test(query)) return true;
  if (isAllowedAllFieldsPhraseQuery(query)) return true;
  return false;
}
