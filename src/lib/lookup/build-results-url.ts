/** @deprecated Legacy results page removed; lookups open in-panel on the decoder. */
export function buildLookupResultsPageUrl(query: string): string {
  const params = new URLSearchParams({ q: query.trim() });
  return `/?${params.toString()}`;
}
