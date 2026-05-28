"use client";

import type { ReactNode } from "react";
import { CepLocationBadge } from "@/components/cep-location-badge";
import { parseCepDigits } from "@/lib/br/normalize-cep";
import type { Locale } from "@/lib/brcode/labels";

type CepEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Wraps a CEP field with a location badge when `active` and the value is a valid CEP. */
export function CepEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: CepEnrichedValueProps) {
  const cepDigits = active ? parseCepDigits(rawValue) : null;

  if (cepDigits === null) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      <CepLocationBadge key={cepDigits} cepDigits={cepDigits} locale={locale} />
    </span>
  );
}
