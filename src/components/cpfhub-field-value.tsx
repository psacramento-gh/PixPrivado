"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/brcode/labels";
import { LookupPortalLink } from "@/components/lookup/lookup-portal-link";
import {
  buildPessoaFisicaPortalUrlFromCpfDigits,
  buildPessoaFisicaPortalUrlFromName,
} from "@/lib/transparencia/portal-link";

type CpfHubFieldValueProps = {
  field: "cpf" | "name";
  displayValue: string;
  locale: Locale;
  /** Raw CPF digits for portal gating when field is cpf. */
  cpfDigits?: string;
  children?: ReactNode;
};

export function CpfHubFieldValue({
  field,
  displayValue,
  locale,
  cpfDigits,
  children,
}: CpfHubFieldValueProps) {
  const portalUrl =
    field === "name"
      ? buildPessoaFisicaPortalUrlFromName(displayValue)
      : cpfDigits
        ? buildPessoaFisicaPortalUrlFromCpfDigits(cpfDigits)
        : null;

  if (portalUrl) {
    return (
      <LookupPortalLink displayValue={displayValue} href={portalUrl} locale={locale} />
    );
  }

  return <>{children ?? displayValue}</>;
}
