import { isCpfSearchQuery } from "@/lib/cpfhub/is-cpf-query";
import { isCnpjSearchQuery } from "@/lib/receita/is-cnpj-query";

export type LookupKind = "cpf" | "cnpj" | "dehashed";

export function resolveLookupKind(query: string): LookupKind {
  const trimmed = query.trim();
  if (isCpfSearchQuery(trimmed)) return "cpf";
  if (isCnpjSearchQuery(trimmed)) return "cnpj";
  return "dehashed";
}
