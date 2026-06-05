"use client";

import { AgeEnrichedValue } from "@/components/age-enriched-value";
import { CpfHubFieldValue } from "@/components/cpfhub-field-value";
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
import { t } from "@/lib/i18n";

export function LookupCpfBody({
  locale,
  result,
}: {
  locale: Locale;
  result: CpfHubLookupResult;
}) {
  if (!result.ok) {
    return (
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
    );
  }

  const { data } = result;
  const birthIso = cpfHubBirthDateToIso(data.birthDate) ?? data.birthDate;
  const rows: {
    labelKey: Parameters<typeof t>[1];
    value: string;
    ageActive?: boolean;
    portalField?: "cpf" | "name";
    cpfDigits?: string;
  }[] = [
    {
      labelKey: "cpfhubFieldCpf",
      value: formatCpf(data.cpf),
      portalField: "cpf",
      cpfDigits: data.cpf,
    },
    { labelKey: "cpfhubFieldName", value: data.name, portalField: "name" },
    { labelKey: "cpfhubFieldGender", value: cpfHubGenderLabel(data.gender, locale) },
    { labelKey: "cpfhubFieldBirthDate", value: data.birthDate, ageActive: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
        {t(locale, "cpfhubAttribution")}
      </p>
      {result.remainingCredits !== null ? (
        <p className="text-sm text-muted-foreground">
          {t(locale, "cpfhubRemainingCredits", {
            count: String(result.remainingCredits),
          })}
        </p>
      ) : null}
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
                ) : row.portalField ? (
                  <CpfHubFieldValue
                    field={row.portalField}
                    displayValue={row.value}
                    cpfDigits={row.cpfDigits}
                  />
                ) : (
                  row.value
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs leading-snug text-muted-foreground">
        {t(locale, "cpfhubDisclaimer")}
      </p>
    </div>
  );
}
