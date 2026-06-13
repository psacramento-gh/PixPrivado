import { buildDehashedResultsPageUrl } from "@/lib/dehashed/results-url";

/** Breach search (DeHashed) or CNPJ registry lookup, based on query shape. */
export function buildLookupResultsPageUrl(
  query: string,
  page = 1,
  options?: { returnTo?: string | null },
): string {
  return buildDehashedResultsPageUrl(query, page, options);
}
