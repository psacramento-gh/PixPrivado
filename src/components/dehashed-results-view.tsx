"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppFrame } from "@/components/app-frame";
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
import { entryRows } from "@/lib/dehashed/format-entry";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type DehashedResultsViewProps = {
  query: string;
  result: DehashedSearchResult | null;
};

export function DehashedResultsView({ query, result }: DehashedResultsViewProps) {
  const [locale, setLocale] = useState<Locale>("en");

  return (
    <AppFrame
      title={t(locale, "title")}
      headerActions={
        <AppHeaderActions locale={locale} onLocaleChange={setLocale} />
      }
    >
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t(locale, "backToDecoder")}
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
              {result.entries.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {result.entries.map((entry, index) => {
                    const rows = entryRows(entry);
                    return (
                      <div key={String(entry.id ?? index)} className="flex flex-col gap-2">
                        {index > 0 ? <Separator /> : null}
                        <p className="text-xs font-medium text-muted-foreground">
                          {t(locale, "dehashedEntry", { index: String(index + 1) })}
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
                                  {row.value}
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
            </>
          ) : null}
        </div>
      )}
    </AppFrame>
  );
}
