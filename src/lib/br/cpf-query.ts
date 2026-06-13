/** Bare 11-digit CPF strings (PIX keys, registry fields). */
export function isCpfSearchQuery(query: string): boolean {
  return /^\d{11}$/.test(query.trim());
}

export function normalizeCpfDigits(query: string): string {
  return query.replace(/\D/g, "");
}
