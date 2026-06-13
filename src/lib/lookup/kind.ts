import { isAllowedBreachQuery } from "@/lib/breach/build-query";
import { isCnpjSearchQuery } from "@/lib/receita/is-cnpj-query";

export type LookupKind = "cnpj" | "breach";

export function resolveLookupKind(query: string): LookupKind {
  const trimmed = query.trim();
  if (isCnpjSearchQuery(trimmed)) return "cnpj";
  return "breach";
}

export function isBreachLookupQuery(query: string): boolean {
  return isAllowedBreachQuery(query.trim());
}
