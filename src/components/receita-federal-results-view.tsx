"use client";

import { ArrowLeft } from "lucide-react";
import { Link } from "next-view-transitions";
import { AppFrame } from "@/components/app-frame";
import { AppHeaderActions } from "@/components/app-header-actions";
import { ReceitaCellValue } from "@/components/receita-cell-value";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import type { ReceitaFetchResult } from "@/lib/receita/api-fetch";
import { receitaFieldLabel } from "@/lib/receita/field-label";
import { flattenPayload } from "@/lib/receita/flatten-payload";
import { mergeReceitaTelefoneRows } from "@/lib/receita/merge-telefone-rows";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/use-app-locale";

type ReceitaFederalResultsViewProps = {
  query: string;
  result: ReceitaFetchResult | null;
};

function ReceitaDataTable({
  locale,
  data,
}: {
  locale: Locale;
  data: Record<string, unknown>;
}) {
  const rows = mergeReceitaTelefoneRows(flattenPayload(data));

  return (
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
                {receitaFieldLabel(row.field, locale)}
              </TableCell>
              <TableCell className="align-top font-mono text-xs break-all whitespace-normal">
                <ReceitaCellValue
                  fieldPath={row.field}
                  value={row.value}
                  locale={locale}
                />
              </TableCell>
            </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ReceitaFederalResultsView({ query, result }: ReceitaFederalResultsViewProps) {
  const [locale, setLocale] = useAppLocale();
  return (
    <AppFrame
      title={t(locale, "title")}
      titleAriaLabel={t(locale, "titleHomeAria")}
      locale={locale}
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
        {!query ? (
          <p className="text-sm text-muted-foreground">{t(locale, "breachMissingQuery")}</p>
        ) : null}
      </header>

      {!query ? null : (
        <div className="flex flex-col gap-6">
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
            {t(locale, "receitaDisclaimer")}
          </p>

          {result && !result.ok ? (
            <div className="flex flex-col gap-2" role="alert">
              <p className="text-sm text-destructive">
                {result.error === "not_found"
                  ? t(locale, "receitaNotFound")
                  : t(locale, "receitaUnavailable")}
                {result.status ? ` (HTTP ${result.status})` : null}
              </p>
            </div>
          ) : null}

          {result?.ok ? (
            <ReceitaDataTable locale={locale} data={result.data} />
          ) : null}
        </div>
      )}
    </AppFrame>
  );
}
