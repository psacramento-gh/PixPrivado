import { classifyPixKey, normalizePhoneForSearch } from "./classify-pix-key";

/** EMV tag 59 (Merchant Name) max length in PIX BR Codes. */
export const MERCHANT_NAME_MAX_LENGTH = 25;

/** Portuguese name particles; excluded from AND queries to reduce noise. */
const NAME_STOP_WORDS = new Set(["de", "da", "do", "dos", "das", "e"]);

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

/**
 * Distinctive tokens for truncated merchant names (Dehashed v2 wildcard is unreliable).
 * Drops stop words and an incomplete final token at the EMV 25-character limit.
 */
export function distinctiveNameTokens(raw: string): string[] {
  const normalized = raw.trim().replace(/\s+/g, " ").toLowerCase();
  let tokens = normalized.split(" ").filter((t) => t && !NAME_STOP_WORDS.has(t));

  if (normalized.length >= MERCHANT_NAME_MAX_LENGTH && tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    if (last.length < 7) tokens = tokens.slice(0, -1);
  }

  return tokens.filter((t) => t.length >= 3);
}

/**
 * Truncated merchant name search without wildcards (v2 wildcard is unreliable).
 * Uses a single name:"…" phrase; the API rejects repeated name: clauses (HTTP 400).
 * Example: ROMOALDO CLOVIS DE ALBUQU → name:"romoaldo clovis"
 */
export function buildTruncatedMerchantNameQuery(raw: string): string {
  const tokens = distinctiveNameTokens(raw);
  if (tokens.length === 0) {
    return buildAllFieldsPhraseQuery(raw);
  }
  return buildNameQuery(tokens.join(" "));
}

/** Tag 59 is often truncated when the display name hits the 25-character EMV limit. */
export function isLikelyTruncatedMerchantName(raw: string): boolean {
  return raw.trim().length >= MERCHANT_NAME_MAX_LENGTH;
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
 * email, or phone. Truncated names use a name-field phrase of distinctive tokens;
 * shorter names use all-fields phrase search; identifiers use PIX key field queries.
 */
export function buildMerchantNameQuery(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const identifierQuery = buildPixKeyQuery(trimmed);
  if (identifierQuery) return identifierQuery;

  if (isLikelyTruncatedMerchantName(trimmed)) {
    return buildTruncatedMerchantNameQuery(trimmed);
  }

  return buildAllFieldsPhraseQuery(trimmed);
}

function isAllowedAllFieldsPhraseQuery(query: string): boolean {
  if (/^"[^"]{1,500}"$/.test(query)) return true;
  if (/^[^\s"\\]{2,200}$/.test(query)) return true;
  return false;
}

function isAllowedNameToken(term: string): boolean {
  return /^[\p{L}\p{N}][\p{L}\p{N} .,'-]*$/u.test(term);
}

/** Allowed queries the API route will forward (abuse guard). */
export function isAllowedDehashedQuery(query: string): boolean {
  if (!query || query.length > 512) return false;
  if (/^email:[^\s&]+@[^\s&]+\.[^\s&]+$/.test(query)) return true;
  if (/^phone:\+?\d{10,15}$/.test(query)) return true;
  if (/^name:"[^"]{1,500}"$/.test(query)) return true;
  if (/^name:[^\s"\\]{2,200}$/.test(query) && isAllowedNameToken(query.slice(5))) return true;
  if (/^\d{11}$/.test(query)) return true;
  if (/^\d{14}$/.test(query)) return true;
  if (isAllowedAllFieldsPhraseQuery(query)) return true;
  return false;
}
