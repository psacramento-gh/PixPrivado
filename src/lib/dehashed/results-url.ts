/** In-app results page (uses server API key; no Dehashed browser session). */
export function buildDehashedResultsPageUrl(query: string, page = 1): string {
  const params = new URLSearchParams({ q: query });
  if (page > 1) {
    params.set("page", String(page));
  }
  return `/dehashed/search?${params.toString()}`;
}
