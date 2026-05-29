"use client";

import type { ReactNode } from "react";
import { DehashedValueLink } from "@/components/dehashed-value-link";
import { CepEnrichedValue } from "@/components/cep-enriched-value";
import { DddEnrichedValue } from "@/components/ddd-enriched-value";
import { PhoneEnrichedValue } from "@/components/phone-enriched-value";
import { isReceitaCepField } from "@/lib/receita/is-cep-field";
import { isReceitaDddField } from "@/lib/receita/is-ddd-field";
import type { Locale } from "@/lib/brcode/labels";
import {
  extractTrailingCpfFromText,
  formatCnpj,
  isReceitaCnpjField,
  isReceitaDehashedNameField,
} from "@/lib/br/format-document";
import {
  buildBreachLookupQuery,
  buildCpfBreachLookupQuery,
  buildNameBreachLookupQuery,
} from "@/lib/receita/breach-link";

type ReceitaCellValueProps = {
  fieldPath: string;
  value: string;
  locale: Locale;
  /** Current Receita results URL — forwarded as `back` on breach search links. */
  breachReturnTo: string;
};

function renderDehashedNameValue(value: string, breachReturnTo: string): ReactNode {
  const embedded = extractTrailingCpfFromText(value);
  if (embedded) {
    const nameQuery = buildNameBreachLookupQuery(embedded.namePart);
    const cpfQuery = buildCpfBreachLookupQuery(embedded.cpfDigits);
    return (
      <>
        {nameQuery ? (
          <DehashedValueLink
            displayValue={embedded.namePart}
            query={nameQuery}
            returnTo={breachReturnTo}
          />
        ) : (
          embedded.namePart
        )}
        {cpfQuery ? (
          <>
            {" "}
            <DehashedValueLink
              displayValue={embedded.cpfFormatted}
              query={cpfQuery}
              returnTo={breachReturnTo}
            />
          </>
        ) : (
          <> {embedded.cpfFormatted}</>
        )}
      </>
    );
  }

  const nameQuery = buildNameBreachLookupQuery(value);
  return nameQuery ? (
    <DehashedValueLink
      displayValue={value}
      query={nameQuery}
      returnTo={breachReturnTo}
    />
  ) : (
    <>{value}</>
  );
}

export function ReceitaCellValue({
  fieldPath,
  value,
  locale,
  breachReturnTo,
}: ReceitaCellValueProps) {
  let content: ReactNode;

  if (isReceitaCnpjField(fieldPath)) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 14) {
      content = <>{formatCnpj(digits)}</>;
    } else {
      content = <>{value}</>;
    }
  } else if (isReceitaDehashedNameField(fieldPath)) {
    content = renderDehashedNameValue(value, breachReturnTo);
  } else {
    const breachQuery = buildBreachLookupQuery(value);
    content =
      breachQuery !== null ? (
        <DehashedValueLink
          displayValue={value}
          query={breachQuery}
          returnTo={breachReturnTo}
        />
      ) : (
        <>{value}</>
      );
  }

  return (
    <PhoneEnrichedValue rawValue={value} locale={locale}>
      <CepEnrichedValue
        rawValue={value}
        locale={locale}
        active={isReceitaCepField(fieldPath)}
      >
        <DddEnrichedValue
          rawValue={value}
          locale={locale}
          active={isReceitaDddField(fieldPath)}
        >
          {content}
        </DddEnrichedValue>
      </CepEnrichedValue>
    </PhoneEnrichedValue>
  );
}
