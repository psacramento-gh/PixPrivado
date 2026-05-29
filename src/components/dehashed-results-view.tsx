"use client";

import { Link } from "next-view-transitions";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AppFrame } from "@/components/app-frame";
import { AgeEnrichedValue } from "@/components/age-enriched-value";
import { IpEnrichedValue } from "@/components/ip-enriched-value";
import { PhoneEnrichedValue } from "@/components/phone-enriched-value";
import { isBirthField } from "@/lib/age/is-birth-field";
import { isDehashedIpField } from "@/lib/ip/parse-ip";
import { AppHeaderActions } from "@/components/app-header-actions";
import { buttonVariants } from "@/components/ui/button";
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
import {
  buildDehashedResultsPageUrl,
  isReceitaResultsReturnPath,
} from "@/lib/dehashed/results-url";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/use-app-locale";

type DehashedResultsViewProps = {
  query: string;
  result: DehashedSearchResult | null;
  backHref?: string;
};

function searchBackLabelKey(backHref: string): "backToDecoder" | "backToReceita" {
  if (isReceitaResultsReturnPath(backHref)) return "backToReceita";
  return "backToDecoder";
}

function DehashedPagination({
  locale,
  query,
  page,
  totalPages,
  returnTo,
}: {
  locale: Locale;
  query: string;
  page: number;
  totalPages: number;
  returnTo?: string | null;
}) {
  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label={t(locale, "dehashedPagination")}
    >
      {prevPage !== null ? (
        <Link
          href={buildDehashedResultsPageUrl(query, prevPage, { returnTo })}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          <ChevronLeft className="size-4" aria-hidden />
          {t(locale, "dehashedPrevious")}
        </Link>
      ) : (
        <span className="invisible h-9 w-px sm:block" aria-hidden />
      )}
      <p className="text-sm text-muted-foreground">
        {t(locale, "dehashedPage", {
          page: String(page),
          pages: String(totalPages),
        })}
      </p>
      {nextPage !== null ? (
        <Link
          href={buildDehashedResultsPageUrl(query, nextPage, { returnTo })}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          {t(locale, "dehashedNext")}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className="invisible h-9 w-px sm:block" aria-hidden />
      )}
    </nav>
  );
}

function DehashedOkResults({
  locale,
  query,
  result,
  returnTo,
}: {
  locale: Locale;
  query: string;
  result: Extract<DehashedSearchResult, { ok: true }>;
  returnTo?: string | null;
}) {
  const currentPage = result.page;
  const pageSize = result.pageSize ?? DEHASHED_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
  const entryOffset = (currentPage - 1) * pageSize;

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {result.total === 0
          ? t(locale, "dehashedNoEntries")
          : t(locale, "dehashedShowing", {
              shown: String(result.entries.length),
              total: String(result.total),
            })}
        {result.balance !== undefined
          ? ` ${t(locale, "dehashedBalance", { balance: String(result.balance) })}`
          : null}
      </p>
      <DehashedPagination
        locale={locale}
        query={query}
        page={currentPage}
        totalPages={totalPages}
        returnTo={returnTo}
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
                          {row.field}
                        </TableCell>
                        <TableCell className="align-top font-mono text-xs break-all whitespace-normal">
                          <IpEnrichedValue
                            rawValue={row.value}
                            locale={locale}
                            active={isDehashedIpField(row.field)}
                          >
                            <PhoneEnrichedValue rawValue={row.value} locale={locale}>
                              <AgeEnrichedValue
                                rawValue={row.value}
                                locale={locale}
                                active={isBirthField(row.field)}
                              >
                                {row.value}
                              </AgeEnrichedValue>
                            </PhoneEnrichedValue>
                          </IpEnrichedValue>
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
      <DehashedPagination
        locale={locale}
        query={query}
        page={currentPage}
        totalPages={totalPages}
        returnTo={returnTo}
      />
    </>
  );
}

export function DehashedResultsView({
  query,
  result,
  backHref = "/",
}: DehashedResultsViewProps) {
  const [locale, setLocale] = useAppLocale();
  const backLabelKey = searchBackLabelKey(backHref);

  return (
    <AppFrame
      title={t(locale, "title")}
      titleAriaLabel={t(locale, "titleHomeAria")}
      aboutLinkLabel={t(locale, "about")}
      headerActions={
        <AppHeaderActions locale={locale} onLocaleChange={setLocale} />
      }
    >
      <header className="flex flex-col gap-3">
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t(locale, backLabelKey)}
        </Link>
        <p className="text-sm text-muted-foreground">
          {query ? t(locale, "dehashedSubtitle") : t(locale, "dehashedMissingQuery")}
        </p>
      </header>

      {!query ? null : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t(locale, "dehashedResults")}
            </p>
            <p className="font-mono text-xs break-all">{result?.query ?? query}</p>
          </div>

          {result && !result.ok ? (
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
          ) : null}

          {result?.ok ? (
            <DehashedOkResults
              locale={locale}
              query={query}
              result={result}
              returnTo={backHref === "/" ? null : backHref}
            />
          ) : null}
        </div>
      )}
    </AppFrame>
  );
}
