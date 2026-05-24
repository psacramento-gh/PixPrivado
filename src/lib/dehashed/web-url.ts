import { DEHASHED_WEB_SEARCH_BASE } from "./constants";

export function buildDehashedWebSearchUrl(query: string): string {
  return `${DEHASHED_WEB_SEARCH_BASE}${encodeURIComponent(query)}`;
}
