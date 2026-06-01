import { buildCpfResultsPageUrl } from "@/lib/cpfhub/results-url";
import { isCpfSearchQuery } from "@/lib/cpfhub/is-cpf-query";
import { buildDehashedResultsPageUrl } from "@/lib/dehashed/results-url";

/** Breach search (DeHashed) or CPF identity lookup (CPFHub), based on query shape. */
export function buildLookupResultsPageUrl(
  query: string,
  page = 1,
  options?: { returnTo?: string | null },
): string {
  if (isCpfSearchQuery(query)) {
    return buildCpfResultsPageUrl(query, options);
  }
  return buildDehashedResultsPageUrl(query, page, options);
}
