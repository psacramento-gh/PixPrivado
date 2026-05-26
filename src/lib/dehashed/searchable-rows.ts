import { PIX_GUI } from "./constants";
import { buildMerchantCnpjQuery, buildMerchantNameQuery, buildPixKeyQuery } from "./build-query";
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

  if (row.id === "59" && row.parentId === null) {
    return buildMerchantNameQuery(row.value);
  }

  if (!isMerchantAccountParent(row.parentId)) return null;
  if (!isPixMerchantAccount(allRows, row.parentId!)) return null;

  if (row.id === "01") {
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

export function isPixKeyRow(row: FlatRow, allRows: FlatRow[]): boolean {
  if (row.id !== "01" || !row.value.trim()) return false;
  if (!isMerchantAccountParent(row.parentId) || !row.parentId) return false;
  return isPixMerchantAccount(allRows, row.parentId);
}

export function getPixKeyKindForRow(
  row: FlatRow,
  allRows: FlatRow[],
): PixKeyKind | null {
  if (!isPixKeyRow(row, allRows)) return null;
  return classifyPixKey(row.value);
}
