"use client";

import type { ReactNode } from "react";
import { CpfCandidatesBadge } from "@/components/cpf-candidates-badge";
import { isReceitaCpfSocioShape } from "@/lib/br/cpf-candidates";
import type { Locale } from "@/lib/brcode/labels";

type CpfSocioEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Adds a CPF candidates badge for Receita partner CPF/CNPJ fields that are CPF-shaped. */
export function CpfSocioEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: CpfSocioEnrichedValueProps) {
  if (!active || !isReceitaCpfSocioShape(rawValue)) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      <CpfCandidatesBadge key={rawValue} rawValue={rawValue} locale={locale} />
    </span>
  );
}
