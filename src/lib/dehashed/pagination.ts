/** DeHashed API allows up to 100 results per request. */
export const DEHASHED_API_MAX_SIZE = 100;

export type DehashedPaginationMeta = {
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  rangeFrom: number;
  rangeTo: number;
};

/** Page count from total hits and UI page size. */
export function dehashedTotalPages(total: number, pageSize: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Whether the requested page is past the last page. */
export function dehashedPageExceedsTotal(page: number, total: number, pageSize: number): boolean {
  return page > dehashedTotalPages(total, pageSize);
}

/**
 * UI pagination derived from the current slice and total hit count.
 * `entryOffset` is zero-based index of the first entry on this page.
 */
export function getDehashedPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
  entryCount: number,
  entryOffset: number,
): DehashedPaginationMeta {
  const totalPages = dehashedTotalPages(total, pageSize);
  const rangeFrom = entryCount > 0 ? entryOffset + 1 : 0;
  const rangeTo = entryCount > 0 ? entryOffset + entryCount : 0;

  return {
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages && entryOffset + entryCount < total,
    rangeFrom,
    rangeTo,
  };
}
