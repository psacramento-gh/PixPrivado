"use client";

import { DehashedValueLink } from "@/components/dehashed-value-link";
import {
  extractTrailingCpfFromText,
  formatCnpj,
  isReceitaCnpjField,
  isReceitaRazaoSocialField,
} from "@/lib/br/format-document";
import {
  buildBreachLookupQuery,
  buildCpfBreachLookupQuery,
  buildNameBreachLookupQuery,
} from "@/lib/receita/breach-link";

type ReceitaCellValueProps = {
  fieldPath: string;
  value: string;
};

export function ReceitaCellValue({ fieldPath, value }: ReceitaCellValueProps) {
  if (isReceitaCnpjField(fieldPath)) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 14) {
      return <>{formatCnpj(digits)}</>;
    }
  }

  if (isReceitaRazaoSocialField(fieldPath)) {
    const embedded = extractTrailingCpfFromText(value);
    if (embedded) {
      const nameQuery = buildNameBreachLookupQuery(embedded.namePart);
      const cpfQuery = buildCpfBreachLookupQuery(embedded.cpfDigits);
      return (
        <>
          {nameQuery ? (
            <DehashedValueLink displayValue={embedded.namePart} query={nameQuery} />
          ) : (
            embedded.namePart
          )}
          {cpfQuery ? (
            <>
              {" "}
              <DehashedValueLink
                displayValue={embedded.cpfFormatted}
                query={cpfQuery}
              />
            </>
          ) : (
            <> {embedded.cpfFormatted}</>
          )}
        </>
      );
    }

    const nameQuery = buildNameBreachLookupQuery(value);
    if (nameQuery) {
      return <DehashedValueLink displayValue={value} query={nameQuery} />;
    }
  }

  const breachQuery = buildBreachLookupQuery(value);
  if (breachQuery !== null) {
    return <DehashedValueLink displayValue={value} query={breachQuery} />;
  }

  return <>{value}</>;
}
