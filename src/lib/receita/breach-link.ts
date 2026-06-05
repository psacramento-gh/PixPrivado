import {
  buildCnpjQuery,
  buildCpfQuery,
  buildNameQuery,
  buildPixKeyQuery,
  isAllowedDehashedQuery,
} from "@/lib/dehashed/build-query";
import { classifyPixKey } from "@/lib/dehashed/classify-pix-key";

/** Email or phone values from Receita may link to a Dehashed breach search on click. */
export function buildBreachLookupQuery(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const kind = classifyPixKey(trimmed);
  if (kind !== "email" && kind !== "phone") return null;

  const query = buildPixKeyQuery(trimmed);
  if (!query || !isAllowedDehashedQuery(query)) return null;
  return query;
}

export function buildCpfBreachLookupQuery(cpfDigits: string): string | null {
  const digits = cpfDigits.replace(/\D/g, "");
  if (digits.length !== 11) return null;
  const query = buildCpfQuery(digits);
  if (!isAllowedDehashedQuery(query)) return null;
  return query;
}

export function buildCnpjBreachLookupQuery(cnpjDigits: string): string | null {
  const digits = cnpjDigits.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  const query = buildCnpjQuery(digits);
  if (!isAllowedDehashedQuery(query)) return null;
  return query;
}

export function buildNameBreachLookupQuery(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const query = buildNameQuery(trimmed);
  if (!isAllowedDehashedQuery(query)) return null;
  return query;
}
