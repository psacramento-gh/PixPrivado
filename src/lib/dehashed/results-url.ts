export const SEARCH_RETURN_PARAM = "back";

/** In-app paths only (abuse guard for the `back` query param). */
export function sanitizeSearchReturnPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.includes("://")) return null;
  if (trimmed.length > 2048) return null;
  if (trimmed === "/") return "/";
  if (trimmed.startsWith("/dehashed/search")) return trimmed;
  if (trimmed.startsWith("/cpf/search")) return trimmed;
  return null;
}

export function isReceitaResultsReturnPath(path: string): boolean {
  try {
    const url = new URL(path, "https://local.invalid");
    const q = url.searchParams.get("q")?.trim() ?? "";
    return url.pathname === "/dehashed/search" && /^\d{14}$/.test(q);
  } catch {
    return false;
  }
}

/** In-app results page (uses server API key; no Dehashed browser session). */
export function buildDehashedResultsPageUrl(
  query: string,
  page = 1,
  options?: { returnTo?: string | null },
): string {
  const params = new URLSearchParams({ q: query });
  if (page > 1) {
    params.set("page", String(page));
  }
  const returnTo = sanitizeSearchReturnPath(options?.returnTo);
  if (returnTo) {
    params.set(SEARCH_RETURN_PARAM, returnTo);
  }
  return `/dehashed/search?${params.toString()}`;
}
