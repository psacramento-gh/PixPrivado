"use client";

import type { ReactNode } from "react";
import { AgeEnrichedValue } from "@/components/age-enriched-value";
import { CnaeEnrichedValue } from "@/components/cnae-enriched-value";
import { DehashedValueLink } from "@/components/dehashed-value-link";
import { CepEnrichedValue } from "@/components/cep-enriched-value";
import { PhoneEnrichedValue } from "@/components/phone-enriched-value";
import { isReceitaCepField } from "@/lib/receita/is-cep-field";
import { isReceitaCnaeField } from "@/lib/receita/is-cnae-field";
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
import {
  buildReceitaTelefoneBreachRaw,
  decodeReceitaTelefoneValue,
  formatReceitaTelefoneDisplay,
  formatReceitaTelefonePartialDisplay,
  isReceitaTelefoneRowField,
} from "@/lib/receita/telefone-row";

type ReceitaCellValueProps = {
  fieldPath: string;
  value: string;
  locale: Locale;
  /** Current Receita results URL — forwarded as `back` on breach search links. */
  breachReturnTo: string;
};

function renderReceitaTelefoneValue(encoded: string, breachReturnTo: string): ReactNode {
  const { ddd, numero } = decodeReceitaTelefoneValue(encoded);
  const display = formatReceitaTelefoneDisplay(ddd, numero);
  if (!display) {
    return <>{formatReceitaTelefonePartialDisplay(ddd, numero) || encoded}</>;
  }

  const breachRaw = buildReceitaTelefoneBreachRaw(ddd, numero);
  const breachQuery = breachRaw ? buildBreachLookupQuery(breachRaw) : null;
  if (!breachQuery) {
    return <>{display}</>;
  }

  return (
    <DehashedValueLink displayValue={display} query={breachQuery} returnTo={breachReturnTo} />
  );
}

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
  let phoneEnrichmentRaw = value;
  let phoneEnrichmentActive = true;

  if (isReceitaTelefoneRowField(fieldPath)) {
    const { ddd, numero } = decodeReceitaTelefoneValue(value);
    content = renderReceitaTelefoneValue(value, breachReturnTo);
    const breachRaw = buildReceitaTelefoneBreachRaw(ddd, numero);
    phoneEnrichmentRaw = breachRaw ?? value;
    phoneEnrichmentActive = breachRaw !== null;
  } else if (isReceitaCnpjField(fieldPath)) {
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
    <PhoneEnrichedValue
      rawValue={phoneEnrichmentRaw}
      locale={locale}
      active={phoneEnrichmentActive}
    >
      <CnaeEnrichedValue
        rawValue={value}
        locale={locale}
        active={isReceitaCnaeField(fieldPath)}
      >
        <CepEnrichedValue
          rawValue={value}
          locale={locale}
          active={isReceitaCepField(fieldPath)}
        >
          <AgeEnrichedValue rawValue={value} locale={locale} active>
            {content}
          </AgeEnrichedValue>
        </CepEnrichedValue>
      </CnaeEnrichedValue>
    </PhoneEnrichedValue>
  );
}
