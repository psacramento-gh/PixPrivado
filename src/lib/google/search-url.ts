const GOOGLE_SEARCH_BASE = "https://www.google.com.br/search";

/** Brazilian Google advanced search — all-words query, Portuguese, Brazil region. */
export function buildGoogleSearchUrl(query: string): string {
  const params = new URLSearchParams({
    as_q: query.trim(),
    lr: "lang_pt",
    cr: "countryBR",
  });
  return `${GOOGLE_SEARCH_BASE}?${params.toString()}`;
}
