"use client";

import type { ReactNode } from "react";
import { AgeBadge } from "@/components/age-badge";
import { IsoDateFormatHint } from "@/components/iso-date-format-hint";
import { ageSegmentsFromValue } from "@/lib/age/age-from-value";
import {
  isoDateSegmentsFromValue,
  type ValueIsoDateSegment,
} from "@/lib/age/iso-date-segments";
import type { Locale } from "@/lib/brcode/labels";

type AgeEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

function renderIsoSegment(
  segment: ValueIsoDateSegment,
  index: number,
  locale: Locale,
  ageByText: Map<string, { age: number }>,
) {
  const age = ageByText.get(segment.text);

  return (
    <span key={`${segment.text}-${index}`} className="inline-flex items-center gap-2">
      {index > 0 ? <span aria-hidden>, </span> : null}
      <IsoDateFormatHint
        dateText={segment.text}
        parsed={segment.parsed}
        locale={locale}
      />
      {age ? <AgeBadge age={age.age} locale={locale} /> : null}
    </span>
  );
}

/** ISO date values get a format hover hint; optional age badges when `active`. */
export function AgeEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: AgeEnrichedValueProps) {
  if (!active) {
    return <>{children}</>;
  }

  const isoSegments = isoDateSegmentsFromValue(rawValue);
  if (isoSegments.length === 0) {
    return <>{children}</>;
  }

  const ageByText = new Map(
    (active ? ageSegmentsFromValue(rawValue) : []).map((segment) => [
      segment.text,
      { age: segment.age },
    ]),
  );

  if (isoSegments.length === 1 && isoSegments[0].text === rawValue.trim()) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        {renderIsoSegment(isoSegments[0], 0, locale, ageByText)}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {isoSegments.map((segment, index) =>
        renderIsoSegment(segment, index, locale, ageByText),
      )}
    </span>
  );
}
