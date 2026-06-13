export function buildEmailQuery(email: string): string {
  return `email:${email.trim()}`;
}

export function extractEmailFromQuery(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed.startsWith("email:")) return null;
  const email = trimmed.slice("email:".length).trim();
  if (!/^[^\s&]+@[^\s&]+\.[^\s&]+$/.test(email)) return null;
  return email;
}

/** Allowed email breach queries the API route will forward (abuse guard). */
export function isAllowedBreachQuery(query: string): boolean {
  if (!query || query.length > 512) return false;
  return extractEmailFromQuery(query) !== null;
}
