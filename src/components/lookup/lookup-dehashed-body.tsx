"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DehashedEntryValue } from "@/components/dehashed-entry-value";
import { DehashedFieldLabel } from "@/components/dehashed-field-label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Locale } from "@/lib/brcode/labels";
import type { DehashedSearchResult } from "@/lib/dehashed/api-search";
import { DEHASHED_PAGE_SIZE } from "@/lib/dehashed/constants";
import { entryRows } from "@/lib/dehashed/format-entry";
import { getDehashedPaginationMeta } from "@/lib/dehashed/pagination";
import { t } from "@/lib/i18n";

function DehashedPanelPagination({
  locale,
  page,
  hasPrevious,
  hasNext,
  totalPages,
  onPageChange,
}: {
  locale: Locale;
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (!hasPrevious && !hasNext) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label={t(locale, "dehashedPagination")}
    >
      {hasPrevious ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
          {t(locale, "dehashedPrevious")}
        </Button>
      ) : (
        <span className="invisible h-9 w-px sm:block" aria-hidden />
      )}
      <p className="text-sm text-muted-foreground">
        {t(locale, "dehashedPage", {
          page: String(page),
          pages: String(totalPages),
        })}
      </p>
      {hasNext ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onPageChange(page + 1)}
        >
          {t(locale, "dehashedNext")}
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      ) : (
        <span className="invisible h-9 w-px sm:block" aria-hidden />
      )}
    </nav>
  );
}

export function LookupDehashedBody({
  locale,
  result,
  page,
  onPageChange,
}: {
  locale: Locale;
  result: DehashedSearchResult;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (!result.ok) {
    return (
      <div className="flex flex-col gap-2" role="alert">
        <p className="text-sm text-destructive">
          {result.error}
          {result.status ? ` (HTTP ${result.status})` : null}
        </p>
        {result.status === 503 ? (
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            <li>{t(locale, "dehashedPreviewHint")}</li>
            <li>{t(locale, "dehashedEnvHint")}</li>
          </ul>
        ) : null}
      </div>
    );
  }

  const pageSize = result.pageSize ?? DEHASHED_PAGE_SIZE;
  const entryOffset = (page - 1) * pageSize;
  const pagination = getDehashedPaginationMeta(
    page,
    pageSize,
    result.total,
    result.entries.length,
    entryOffset,
  );

  const showingText =
    result.total === 0
      ? t(locale, "dehashedNoEntries")
      : result.entries.length === 0
        ? t(locale, "dehashedNoEntries")
        : pagination.rangeFrom === pagination.rangeTo
          ? t(locale, "dehashedShowing", {
              shown: String(pagination.rangeFrom),
              total: String(result.total),
            })
          : t(locale, "dehashedShowingRange", {
              from: String(pagination.rangeFrom),
              to: String(pagination.rangeTo),
              total: String(result.total),
            });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {showingText}
        {result.balance !== undefined
          ? ` ${t(locale, "dehashedBalance", { balance: String(result.balance) })}`
          : null}
      </p>
      <DehashedPanelPagination
        locale={locale}
        page={page}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
      {result.entries.length > 0 ? (
        <div className="flex flex-col gap-6">
          {result.entries.map((entry, index) => {
            const rows = entryRows(entry);
            const entryNumber = entryOffset + index + 1;
            return (
              <div key={String(entry.id ?? index)} className="flex flex-col gap-2">
                {index > 0 ? <Separator /> : null}
                <p className="text-xs font-medium text-muted-foreground">
                  {t(locale, "dehashedEntry", { index: String(entryNumber) })}
                  {entry.id ? ` · ${String(entry.id)}` : null}
                </p>
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[34%] max-w-28 whitespace-normal align-top text-xs sm:max-w-none sm:w-[38%] sm:text-sm">
                        {t(locale, "label")}
                      </TableHead>
                      <TableHead className="whitespace-normal align-top text-xs sm:text-sm">
                        {t(locale, "value")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.field}>
                        <TableCell className="w-[34%] max-w-28 align-top text-xs leading-snug break-words whitespace-normal text-muted-foreground sm:max-w-none sm:w-[38%] sm:text-sm">
                          <DehashedFieldLabel field={row.field} locale={locale} />
                        </TableCell>
                        <TableCell className="align-top font-mono text-xs break-all whitespace-normal">
                          <DehashedEntryValue
                            field={row.field}
                            value={row.value}
                            locale={locale}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      ) : null}
      {result.entries.length > 0 ? (
        <DehashedPanelPagination
          locale={locale}
          page={page}
          hasPrevious={pagination.hasPrevious}
          hasNext={pagination.hasNext}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
