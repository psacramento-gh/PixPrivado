import { SEARCH_RETURN_PARAM, sanitizeSearchReturnPath } from "@/lib/dehashed/results-url";

/** In-app CPF identity lookup (server-side CPFHub API key). */
export function buildCpfResultsPageUrl(
  cpfDigits: string,
  options?: { returnTo?: string | null },
): string {
  const params = new URLSearchParams({ q: cpfDigits.replace(/\D/g, "") });
  const returnTo = sanitizeSearchReturnPath(options?.returnTo);
  if (returnTo) {
    params.set(SEARCH_RETURN_PARAM, returnTo);
  }
  return `/cpf/search?${params.toString()}`;
}
