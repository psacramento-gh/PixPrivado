import { PIX_GUI } from "@/lib/breach/constants";
import { buildEmailQuery } from "@/lib/breach/build-query";
import { buildMerchantCnpjQuery } from "@/lib/lookup/merchant-query";
import { buildMerchantNameGoogleSearchUrl } from "@/lib/google/merchant-name-link";
import {
  buildMerchantNameIdentifierPortalUrl,
  buildPessoaFisicaPortalUrlFromCpfDigits,
} from "@/lib/transparencia/portal-link";
import { classifyPixKey, type PixKeyKind } from "@/lib/pix/classify-pix-key";

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

export function buildLookupQueryForRow(
  row: FlatRow,
  allRows: FlatRow[],
): string | null {
  if (!row.value.trim()) return null;

  if (!isMerchantAccountParent(row.parentId)) return null;
  if (!isPixMerchantAccount(allRows, row.parentId!)) return null;

  if (row.id === "01") {
    const kind = classifyPixKey(row.value);
    if (kind !== "email") return null;
    return buildEmailQuery(row.value);
  }

  if (row.id === "04") {
    return buildMerchantCnpjQuery(row.value);
  }

  return null;
}

export function rowHasLookupLink(row: FlatRow, allRows: FlatRow[]): boolean {
  return buildLookupQueryForRow(row, allRows) !== null;
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

function isPixKeyRow(row: FlatRow, allRows: FlatRow[]): boolean {
  if (row.id !== "01" || !row.value.trim()) return false;
  if (!isMerchantAccountParent(row.parentId) || !row.parentId) return false;
  return isPixMerchantAccount(allRows, row.parentId);
}

export function buildPortalUrlForPixKeyRow(
  row: FlatRow,
  allRows: FlatRow[],
): string | null {
  if (!isPixKeyRow(row, allRows)) return null;
  if (classifyPixKey(row.value) !== "cpf") return null;
  const digits = row.value.replace(/\D/g, "");
  return buildPessoaFisicaPortalUrlFromCpfDigits(digits);
}

export function rowHasPixKeyPortalLink(row: FlatRow, allRows: FlatRow[]): boolean {
  return buildPortalUrlForPixKeyRow(row, allRows) !== null;
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
