import { buildPixKeyQuery, isAllowedDehashedQuery } from "@/lib/dehashed/build-query";
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
