"use client";

import type { ReactNode } from "react";
import { CnaeActivityBadge } from "@/components/cnae-activity-badge";
import { parseCnaeDigits } from "@/lib/br/parse-cnae";
import type { Locale } from "@/lib/brcode/labels";

type CnaeEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Wraps a CNAE code field with an activity badge from IBGE when `active` and valid. */
export function CnaeEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: CnaeEnrichedValueProps) {
  const cnaeDigits = active ? parseCnaeDigits(rawValue) : null;

  if (cnaeDigits === null) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      <CnaeActivityBadge key={cnaeDigits} cnaeDigits={cnaeDigits} locale={locale} />
    </span>
  );
}
