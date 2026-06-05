import { PIX_GUI } from "./constants";
import { buildMerchantCnpjQuery, buildPixKeyQuery } from "./build-query";
import { buildMerchantNameGoogleSearchUrl } from "@/lib/google/merchant-name-link";
import { buildMerchantNameIdentifierPortalUrl } from "@/lib/transparencia/portal-link";
import { classifyPixKey, type PixKeyKind } from "./classify-pix-key";

export type FlatRow = {
  id: string;
  parentId: string | null;
  value: string;
};

function isMerchantAccountParent(parentId: string | null): boolean {
  if (!parentId) return false;
  const n = parseInt(parentId, 10);
  return !Number.isNaN(n) && n >= 26 && n <= 51;
}

function isPixMerchantAccount(rows: FlatRow[], parentId: string): boolean {
  return rows.some(
    (r) =>
      r.parentId === parentId &&
      r.id === "00" &&
      r.value.trim().toLowerCase() === PIX_GUI,
  );
}

export function buildDehashedQueryForRow(
  row: FlatRow,
  allRows: FlatRow[],
): string | null {
  if (!row.value.trim()) return null;

  if (!isMerchantAccountParent(row.parentId)) return null;
  if (!isPixMerchantAccount(allRows, row.parentId!)) return null;

  if (row.id === "01") {
    if (classifyPixKey(row.value) === "phone") return null;
    return buildPixKeyQuery(row.value);
  }

  if (row.id === "04") {
    return buildMerchantCnpjQuery(row.value);
  }

  return null;
}

export function rowHasDehashedLink(row: FlatRow, allRows: FlatRow[]): boolean {
  return buildDehashedQueryForRow(row, allRows) !== null;
}

function isMerchantNameRow(row: FlatRow): boolean {
  return row.id === "59" && row.parentId === null && row.value.trim().length > 0;
}

export function buildGoogleSearchUrlForMerchantNameRow(row: FlatRow): string | null {
  if (!isMerchantNameRow(row)) return null;
  return buildMerchantNameGoogleSearchUrl(row.value);
}

export function rowHasMerchantNameGoogleLink(row: FlatRow): boolean {
  return buildGoogleSearchUrlForMerchantNameRow(row) !== null;
}

export function buildPortalUrlForMerchantNameIdentifierRow(
  row: FlatRow,
  displayValue: string,
): string | null {
  if (!isMerchantNameRow(row)) return null;
  return buildMerchantNameIdentifierPortalUrl(row.value, displayValue);
}

export function rowHasMerchantNamePortalLink(
  row: FlatRow,
  displayValue: string,
): boolean {
  return buildPortalUrlForMerchantNameIdentifierRow(row, displayValue) !== null;
}

function isPixMerchantAccountChildRow(row: FlatRow, allRows: FlatRow[]): boolean {
  if (!row.value.trim()) return false;
  if (!isMerchantAccountParent(row.parentId) || !row.parentId) return false;
  return isPixMerchantAccount(allRows, row.parentId);
}

/** Badge kind for PIX Key (01) or Merchant CNPJ (04) in the structured EMV table. */
export function getStructuredValueBadgeKind(
  row: FlatRow,
  allRows: FlatRow[],
): PixKeyKind | null {
  if (!isPixMerchantAccountChildRow(row, allRows)) return null;

  if (row.id === "01") {
    return classifyPixKey(row.value);
  }

  if (row.id === "04") {
    const digits = row.value.replace(/\D/g, "");
    return digits.length === 14 ? "cnpj" : "unsupported";
  }

  return null;
}
