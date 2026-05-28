/** OpenCNPJ public API — Receita Federal dataset (see https://opencnpj.org/). */
export const OPENCNPJ_RECEITA_REVALIDATE_SECONDS = 86_400;

export const RECEITA_FETCH_TIMEOUT_MS = 15_000;

export function buildReceitaApiUrl(cnpjDigits: string): string {
  return `https://api.opencnpj.org/${cnpjDigits}?dataset=receita`;
}
