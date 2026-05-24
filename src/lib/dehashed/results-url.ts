/** In-app results page (uses server API key; no Dehashed browser session). */
export function buildDehashedResultsPageUrl(query: string): string {
  return `/dehashed/search?q=${encodeURIComponent(query)}`;
}
