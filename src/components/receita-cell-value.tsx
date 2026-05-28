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
      const cpfQuery = buildCpfBreachLookupQuery(embedded.cpfDigits);
      if (cpfQuery) {
        return (
          <>
            {embedded.namePart}{" "}
            <DehashedValueLink
              displayValue={embedded.cpfFormatted}
              query={cpfQuery}
            />
          </>
        );
      }
    }
  }

  const breachQuery = buildBreachLookupQuery(value);
  if (breachQuery !== null) {
    return <DehashedValueLink displayValue={value} query={breachQuery} />;
  }

  return <>{value}</>;
}
