import { normalizeCpfDigits } from "@/lib/cpfhub/is-cpf-query";
import { normalizeCnpjDigits } from "@/lib/receita/is-cnpj-query";

/** Stable key for matching lookup panels that refer to the same CPF or CNPJ. */
export function normalizeLookupQueryKey(query: string): string {
  const trimmed = query.trim();
  const cpfDigits = normalizeCpfDigits(trimmed);
  if (cpfDigits.length === 11 && /^\d{11}$/.test(cpfDigits)) {
    return cpfDigits;
  }
  const cnpjDigits = normalizeCnpjDigits(trimmed);
  if (cnpjDigits.length === 14 && /^\d{14}$/.test(cnpjDigits)) {
    return cnpjDigits;
  }
  return trimmed;
}
