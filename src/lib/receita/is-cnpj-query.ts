/** Breach search URLs use a bare 14-digit CNPJ for PIX key, merchant CNPJ, or name-as-CNPJ. */
export function isCnpjSearchQuery(query: string): boolean {
  return /^\d{14}$/.test(query.trim());
}

export function normalizeCnpjDigits(query: string): string {
  return query.replace(/\D/g, "");
}
