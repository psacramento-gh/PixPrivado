"use client";

import type { ReactNode } from "react";
import { PhoneDddBadges } from "@/components/phone-ddd-badges";
import { parseDddValue } from "@/lib/br/parse-ddd";
import type { Locale } from "@/lib/brcode/labels";

type DddEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Wraps a Receita DDD field with state and cities badges when `active` and valid. */
export function DddEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: DddEnrichedValueProps) {
  const ddd = active ? parseDddValue(rawValue) : null;

  if (ddd === null) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      <PhoneDddBadges key={ddd} ddd={ddd} locale={locale} />
    </span>
  );
}
