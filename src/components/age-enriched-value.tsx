"use client";

import type { ReactNode } from "react";
import { AgeBadge } from "@/components/age-badge";
import { ageSegmentsFromValue } from "@/lib/age/age-from-value";
import type { Locale } from "@/lib/brcode/labels";

type AgeEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Wraps a value with amber age badges when `active` and the value contains ISO dates. */
export function AgeEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: AgeEnrichedValueProps) {
  if (!active) {
    return <>{children}</>;
  }

  const segments = ageSegmentsFromValue(rawValue);
  if (segments.length === 0) {
    return <>{children}</>;
  }

  if (segments.length === 1 && segments[0].text === rawValue.trim()) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        {children}
        <AgeBadge age={segments[0].age} locale={locale} />
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {segments.map((segment, index) => (
        <span key={`${segment.text}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden>, </span> : null}
          {segment.text}
          <AgeBadge age={segment.age} locale={locale} />
        </span>
      ))}
    </span>
  );
}
