import { isCnpjSearchQuery } from "@/lib/receita/is-cnpj-query";

export type LookupKind = "cnpj" | "dehashed";

export function resolveLookupKind(query: string): LookupKind {
  const trimmed = query.trim();
  if (isCnpjSearchQuery(trimmed)) return "cnpj";
  return "dehashed";
}
