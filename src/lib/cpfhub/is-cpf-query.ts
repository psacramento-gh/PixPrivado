/** Lookup URLs use a bare 11-digit CPF (PIX key or registry field). */
export function isCpfSearchQuery(query: string): boolean {
  return /^\d{11}$/.test(query.trim());
}

export function normalizeCpfDigits(query: string): string {
  return query.replace(/\D/g, "");
}
