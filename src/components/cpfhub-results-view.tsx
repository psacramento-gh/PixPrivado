"use client";

import { ArrowLeft } from "lucide-react";
import { Link } from "next-view-transitions";
import { AgeEnrichedValue } from "@/components/age-enriched-value";
import { AppFrame } from "@/components/app-frame";
import { AppHeaderActions } from "@/components/app-header-actions";
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
import { formatCpf } from "@/lib/br/format-document";
import { cpfHubBirthDateToIso } from "@/lib/cpfhub/brazil-birth-date";
import { cpfHubGenderLabel } from "@/lib/cpfhub/api-fetch";
import type { CpfHubLookupResult } from "@/lib/cpfhub/types";
import { isReceitaResultsReturnPath } from "@/lib/dehashed/results-url";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/use-app-locale";

type CpfHubResultsViewProps = {
  query: string;
  result: CpfHubLookupResult | null;
  backHref?: string;
};

function searchBackLabelKey(backHref: string): "backToDecoder" | "backToReceita" {
  if (isReceitaResultsReturnPath(backHref)) return "backToReceita";
  return "backToDecoder";
}

function CpfHubDataTable({
  locale,
  result,
}: {
  locale: Locale;
  result: Extract<CpfHubLookupResult, { ok: true }>;
}) {
  const { data } = result;
  const birthIso = cpfHubBirthDateToIso(data.birthDate) ?? data.birthDate;

  const rows: { labelKey: Parameters<typeof t>[1]; value: string; ageActive?: boolean }[] = [
    { labelKey: "cpfhubFieldCpf", value: formatCpf(data.cpf) },
    { labelKey: "cpfhubFieldName", value: data.name },
    { labelKey: "cpfhubFieldNameUpper", value: data.nameUpper },
    {
      labelKey: "cpfhubFieldGender",
      value: cpfHubGenderLabel(data.gender, locale),
    },
    { labelKey: "cpfhubFieldBirthDate", value: data.birthDate, ageActive: true },
    { labelKey: "cpfhubFieldDay", value: String(data.day) },
    { labelKey: "cpfhubFieldMonth", value: String(data.month) },
    { labelKey: "cpfhubFieldYear", value: String(data.year) },
  ];

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
          <TableRow key={row.labelKey}>
            <TableCell className="w-[34%] max-w-28 align-top text-xs leading-snug break-words whitespace-normal text-muted-foreground sm:max-w-none sm:w-[38%] sm:text-sm">
              {t(locale, row.labelKey)}
            </TableCell>
            <TableCell className="align-top font-mono text-xs break-all whitespace-normal">
              {row.ageActive ? (
                <AgeEnrichedValue rawValue={birthIso} locale={locale} active>
                  {row.value}
                </AgeEnrichedValue>
              ) : (
                row.value
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RemainingCreditsNote({
  locale,
  remainingCredits,
}: {
  locale: Locale;
  remainingCredits: number | null;
}) {
  if (remainingCredits === null) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {t(locale, "cpfhubRemainingCredits", { count: String(remainingCredits) })}
    </p>
  );
}

export function CpfHubResultsView({
  query,
  result,
  backHref = "/",
}: CpfHubResultsViewProps) {
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
          {query ? t(locale, "cpfhubSubtitle") : t(locale, "cpfhubMissingQuery")}
        </p>
      </header>

      {!query ? null : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t(locale, "cpfhubResults")}
            </p>
            <p className="font-mono text-xs break-all">{result?.cpf ?? query}</p>
          </div>

          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
            {t(locale, "cpfhubAttribution")}
          </p>

          {result && !result.ok ? (
            <div className="flex flex-col gap-2" role="alert">
              <p className="text-sm text-destructive">
                {result.code === "CPF_NOT_FOUND" ? t(locale, "cpfhubNotFound") : result.error}
                {result.status && result.code !== "CPF_NOT_FOUND"
                  ? ` (HTTP ${result.status})`
                  : null}
              </p>
              {result.status === 503 ? (
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  <li>{t(locale, "dehashedPreviewHint")}</li>
                  <li>{t(locale, "cpfhubEnvHint")}</li>
                </ul>
              ) : null}
              {result.status === 429 ? (
                <p className="text-sm text-muted-foreground">{t(locale, "cpfhubRateLimit")}</p>
              ) : null}
            </div>
          ) : null}

          {result?.ok ? (
            <>
              <RemainingCreditsNote locale={locale} remainingCredits={result.remainingCredits} />
              <CpfHubDataTable locale={locale} result={result} />
              <p className="text-xs leading-snug text-muted-foreground">
                {t(locale, "cpfhubDisclaimer")}
              </p>
            </>
          ) : null}
        </div>
      )}
    </AppFrame>
  );
}
