import codes from "@/lib/br/mcc/codes.json";

/** MCC descriptions from greggles/mcc-codes (ISO 18245, edited descriptions). */
const MCC_DESCRIPTIONS: Record<string, string> = codes;

/** Normalizes EMV tag 52 values to a 4-digit MCC code. */
export function parseMccCode(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0 || digits.length > 4) return null;
  return digits.padStart(4, "0");
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
