import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { getManualCurrencyLabel } from "./currency-labels";
import {
  ISO4217_DEFAULT_SYMBOLS,
  ISO4217_ENGLISH_NAMES,
  lookupIso4217Alpha,
  normalizeIso4217Numeric,
} from "./iso4217";

export type CurrencyDisplay = {
  alpha: string;
  numeric: string;
  symbol: string;
  name: string;
  ariaLabel: string;
};

export function resolveCurrencyDisplay(
  numericCode: string,
  locale: Locale,
): CurrencyDisplay | null {
  const numeric = normalizeIso4217Numeric(numericCode);
  if (!numeric) return null;

  const alpha = lookupIso4217Alpha(numeric);
  if (!alpha) return null;

  const manual = getManualCurrencyLabel(alpha, locale);
  const englishName = ISO4217_ENGLISH_NAMES[alpha] ?? alpha;
  const symbol =
    manual?.symbol ??
    ISO4217_DEFAULT_SYMBOLS[alpha] ??
    alpha;
  const name =
    manual?.name ??
    (locale === "en"
      ? englishName
      : t(locale, "currencyNameFallback", { alpha, englishName }));

  return {
    alpha,
    numeric,
    symbol,
    name,
    ariaLabel: t(locale, "currencyAriaLabel", { name, alpha, numeric }),
  };
}

export function isTransactionCurrencyRow(row: {
  id: string;
  parentId: string | null;
}): boolean {
  return row.id === "53" && row.parentId === null;
}
