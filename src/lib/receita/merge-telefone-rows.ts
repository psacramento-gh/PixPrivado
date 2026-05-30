import type { FlatPayloadRow } from "./flatten-payload";
import { encodeReceitaTelefoneValue } from "./telefone-row";

const TELEFONE_PART = /^telefones\[(\d+)\]\.(ddd|numero)$/;

/**
 * Collapses `telefones[n].ddd` and `telefones[n].numero` into one row per index.
 * Applies to every `telefones[n]` entry in the payload, not only indices 0 and 1.
 */
export function mergeReceitaTelefoneRows(rows: FlatPayloadRow[]): FlatPayloadRow[] {
  const byIndex = new Map<number, { ddd?: string; numero?: string }>();

  for (const row of rows) {
    const match = row.field.match(TELEFONE_PART);
    if (!match) continue;
    const index = Number(match[1]);
    const part = match[2] as "ddd" | "numero";
    const entry = byIndex.get(index) ?? {};
    entry[part] = row.value;
    byIndex.set(index, entry);
  }

  if (byIndex.size === 0) return rows;

  const out: FlatPayloadRow[] = [];
  const emitted = new Set<number>();

  for (const row of rows) {
    const match = row.field.match(TELEFONE_PART);
    if (!match) {
      out.push(row);
      continue;
    }
    const index = Number(match[1]);
    if (emitted.has(index)) continue;
    emitted.add(index);
    const entry = byIndex.get(index)!;
    out.push({
      field: `telefones[${index}]`,
      value: encodeReceitaTelefoneValue(entry.ddd ?? "", entry.numero ?? ""),
    });
  }

  return out;
}
