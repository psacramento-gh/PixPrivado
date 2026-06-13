import { buildEmailQuery, isAllowedBreachQuery } from "@/lib/breach/build-query";
import {
  buildCnpjQuery,
  buildNameQuery,
  isAllowedMerchantLookupQuery,
} from "@/lib/lookup/merchant-query";
import { classifyPixKey } from "@/lib/pix/classify-pix-key";

/** Email values may link to a HIBP breach search on click. */
export function buildBreachLookupQuery(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (classifyPixKey(trimmed) !== "email") return null;

  const query = buildEmailQuery(trimmed);
  if (!isAllowedBreachQuery(query)) return null;
  return query;
}

/** Portal link gating for CNPJ-shaped values. */
export function buildCnpjPortalGateQuery(cnpjDigits: string): string | null {
  const digits = cnpjDigits.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  const query = buildCnpjQuery(digits);
  if (!isAllowedMerchantLookupQuery(query)) return null;
  return query;
}

/** Portal link gating for person/company names. */
export function buildNamePortalGateQuery(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const query = buildNameQuery(trimmed);
  if (!isAllowedMerchantLookupQuery(query)) return null;
  return query;
}
