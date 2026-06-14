import codes from "./codes.json" with { type: "json" };

/** MCC descriptions from greggles/mcc-codes (ISO 18245, edited descriptions). */
const MCC_DESCRIPTIONS: Record<string, string> = codes;

/** Normalizes EMV tag 52 values to a 4-digit MCC code. */
export function parseMccCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^\d{1,4}$/.test(trimmed)) return null;
  return trimmed.padStart(4, "0");
}

export function lookupMccDescription(raw: string): string | null {
  const code = parseMccCode(raw);
  if (!code) return null;
  return MCC_DESCRIPTIONS[code] ?? null;
}

export function isStructuredMerchantCategoryField(row: {
  id: string;
  parentId: string | null;
}): boolean {
  return row.id === "52" && row.parentId === null;
}
