const GOOGLE_SEARCH_BASE = "https://www.google.com.br/search";

/** Brazilian Google web search (unquoted query, pt-BR locale hints). */
export function buildGoogleSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query.trim(),
    hl: "pt-BR",
    gl: "br",
  });
  return `${GOOGLE_SEARCH_BASE}?${params.toString()}`;
}
