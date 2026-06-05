"use client";

import type { ReactNode } from "react";
import { AgeEnrichedValue } from "@/components/age-enriched-value";
import { CnaeEnrichedValue } from "@/components/cnae-enriched-value";
import { CpfSocioEnrichedValue } from "@/components/cpf-socio-enriched-value";
import { LookupPortalLink } from "@/components/lookup/lookup-portal-link";
import { LookupValueButton } from "@/components/lookup/lookup-value-button";
import { CepEnrichedValue } from "@/components/cep-enriched-value";
import { PhoneEnrichedValue } from "@/components/phone-enriched-value";
import { isReceitaCnpjCpfSocioField } from "@/lib/br/cpf-candidates";
import { isReceitaCepField } from "@/lib/receita/is-cep-field";
import { isReceitaCnaeField } from "@/lib/receita/is-cnae-field";
import { isReceitaDateField } from "@/lib/receita/is-date-field";
import type { Locale } from "@/lib/brcode/labels";
import {
  extractTrailingCpfFromText,
  formatCnpj,
  isReceitaCnpjField,
  isReceitaDehashedNameField,
  isReceitaRazaoSocialField,
} from "@/lib/br/format-document";
import { buildBreachLookupQuery } from "@/lib/receita/breach-link";
import {
  buildPessoaFisicaPortalUrlFromCpfDigits,
  buildPessoaFisicaPortalUrlFromName,
  buildPessoaJuridicaPortalUrlFromCnpjDigits,
  buildPessoaJuridicaPortalUrlFromName,
} from "@/lib/transparencia/portal-link";
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
};

function renderReceitaTelefoneValue(encoded: string): ReactNode {
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

  return <LookupValueButton displayValue={display} query={breachQuery} />;
}

function buildReceitaNamePortalUrl(name: string, fieldPath: string): string | null {
  return isReceitaRazaoSocialField(fieldPath)
    ? buildPessoaJuridicaPortalUrlFromName(name)
    : buildPessoaFisicaPortalUrlFromName(name);
}

function renderPortalNameValue(
  value: string,
  fieldPath: string,
  locale: Locale,
): ReactNode {
  const embedded = extractTrailingCpfFromText(value);
  if (embedded) {
    const nameUrl = buildReceitaNamePortalUrl(embedded.namePart, fieldPath);
    const cpfUrl = buildPessoaFisicaPortalUrlFromCpfDigits(embedded.cpfDigits);
    return (
      <>
        {nameUrl ? (
          <LookupPortalLink
            displayValue={embedded.namePart}
            href={nameUrl}
            locale={locale}
          />
        ) : (
          embedded.namePart
        )}
        {cpfUrl ? (
          <>
            {" "}
            <LookupPortalLink
              displayValue={embedded.cpfFormatted}
              href={cpfUrl}
              locale={locale}
            />
          </>
        ) : (
          <> {embedded.cpfFormatted}</>
        )}
      </>
    );
  }

  const nameUrl = buildReceitaNamePortalUrl(value, fieldPath);
  return nameUrl ? (
    <LookupPortalLink displayValue={value} href={nameUrl} locale={locale} />
  ) : (
    <>{value}</>
  );
}

export function ReceitaCellValue({ fieldPath, value, locale }: ReceitaCellValueProps) {
  let content: ReactNode;
  let phoneEnrichmentRaw = value;
  let phoneEnrichmentActive = true;

  if (isReceitaTelefoneRowField(fieldPath)) {
    const { ddd, numero } = decodeReceitaTelefoneValue(value);
    content = renderReceitaTelefoneValue(value);
    const breachRaw = buildReceitaTelefoneBreachRaw(ddd, numero);
    phoneEnrichmentRaw = breachRaw ?? value;
    phoneEnrichmentActive = breachRaw !== null;
  } else if (isReceitaCnpjField(fieldPath)) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 14) {
      const display = formatCnpj(digits);
      const portalUrl = buildPessoaJuridicaPortalUrlFromCnpjDigits(digits);
      content = portalUrl ? (
        <LookupPortalLink displayValue={display} href={portalUrl} locale={locale} />
      ) : (
        <>{display}</>
      );
    } else {
      content = <>{value}</>;
    }
  } else if (isReceitaCnpjCpfSocioField(fieldPath)) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 14) {
      content = <>{formatCnpj(digits)}</>;
    } else {
      content = <>{value}</>;
    }
  } else if (isReceitaDehashedNameField(fieldPath)) {
    content = renderPortalNameValue(value, fieldPath, locale);
  } else {
    const breachQuery = buildBreachLookupQuery(value);
    content =
      breachQuery !== null ? (
        <LookupValueButton displayValue={value} query={breachQuery} />
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
          <CpfSocioEnrichedValue
            rawValue={value}
            locale={locale}
            active={isReceitaCnpjCpfSocioField(fieldPath)}
          >
            <AgeEnrichedValue
              rawValue={value}
              locale={locale}
              active={isReceitaDateField(fieldPath)}
            >
              {content}
            </AgeEnrichedValue>
          </CpfSocioEnrichedValue>
        </CepEnrichedValue>
      </CnaeEnrichedValue>
    </PhoneEnrichedValue>
  );
}
