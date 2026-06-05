"use client";

import type { ReactNode } from "react";
import { AgeEnrichedValue } from "@/components/age-enriched-value";
import { IpEnrichedValue } from "@/components/ip-enriched-value";
import { LookupValueButton } from "@/components/lookup/lookup-value-button";
import { isBirthField } from "@/lib/age/is-birth-field";
import type { Locale } from "@/lib/brcode/labels";
import { buildBreachLookupQuery } from "@/lib/receita/breach-link";
import {
  isDehashedEmailField,
  isDehashedIpField,
  isDehashedPhoneField,
  splitDehashedListValues,
} from "@/lib/ip/parse-ip";

type DehashedEntryValueProps = {
  field: string;
  value: string;
  locale: Locale;
};

function joinListParts(parts: ReactNode[]): ReactNode {
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return parts.flatMap((part, index) =>
    index === 0 ? [part] : [<span key={`sep-${index}`}>, </span>, part],
  );
}

function renderEmailFieldValue(value: string): ReactNode {
  const parts = splitDehashedListValues(value);
  const nodes = parts.map((part, index) => {
    const query = buildBreachLookupQuery(part);
    if (!query) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }
    return (
      <LookupValueButton key={`${part}-${index}`} displayValue={part} query={query} />
    );
  });
  return joinListParts(nodes);
}

/** Renders a Dehashed breach entry cell: email pivots only; phone stays plain text. */
export function DehashedEntryValue({ field, value, locale }: DehashedEntryValueProps) {
  if (isDehashedEmailField(field)) {
    return <>{renderEmailFieldValue(value)}</>;
  }

  if (isDehashedPhoneField(field)) {
    return <>{value}</>;
  }

  return (
    <IpEnrichedValue
      rawValue={value}
      locale={locale}
      active={isDehashedIpField(field)}
    >
      <AgeEnrichedValue rawValue={value} locale={locale} active={isBirthField(field)}>
        {value}
      </AgeEnrichedValue>
    </IpEnrichedValue>
  );
}
