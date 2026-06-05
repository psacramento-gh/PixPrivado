"use client";

import type { ReactNode } from "react";
import { LookupExternalLink } from "@/components/lookup/lookup-external-link";
import {
  buildPessoaFisicaPortalUrlFromCpfDigits,
  buildPessoaFisicaPortalUrlFromName,
} from "@/lib/transparencia/portal-link";

type CpfHubFieldValueProps = {
  field: "cpf" | "name";
  displayValue: string;
  /** Raw CPF digits for portal gating when field is cpf. */
  cpfDigits?: string;
  children?: ReactNode;
};

export function CpfHubFieldValue({
  field,
  displayValue,
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
    return <LookupExternalLink displayValue={displayValue} href={portalUrl} />;
  }

  return <>{children ?? displayValue}</>;
}
