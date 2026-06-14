import type { Locale } from "@/lib/brcode/labels";

export type CurrencyLabel = {
  symbol: { en: string; pt: string };
  name: { en: string; pt: string };
};

/** Manual localized symbols and names; ISO reference data fills gaps elsewhere. */
export const CURRENCY_LABELS: Readonly<Partial<Record<string, CurrencyLabel>>> = {
  BRL: {
    symbol: { en: "R$", pt: "R$" },
    name: { en: "Brazilian Real", pt: "Real brasileiro" },
  },
  USD: {
    symbol: { en: "US$", pt: "US$" },
    name: { en: "US Dollar", pt: "Dólar americano" },
  },
  EUR: {
    symbol: { en: "€", pt: "€" },
    name: { en: "Euro", pt: "Euro" },
  },
  GBP: {
    symbol: { en: "£", pt: "£" },
    name: { en: "Pound Sterling", pt: "Libra esterlina" },
  },
  JPY: {
    symbol: { en: "¥", pt: "¥" },
    name: { en: "Japanese Yen", pt: "Iene japonês" },
  },
  CAD: {
    symbol: { en: "CA$", pt: "CA$" },
    name: { en: "Canadian Dollar", pt: "Dólar canadense" },
  },
  AUD: {
    symbol: { en: "A$", pt: "A$" },
    name: { en: "Australian Dollar", pt: "Dólar australiano" },
  },
  CHF: {
    symbol: { en: "CHF", pt: "CHF" },
    name: { en: "Swiss Franc", pt: "Franco suíço" },
  },
  CNY: {
    symbol: { en: "¥", pt: "¥" },
    name: { en: "Yuan Renminbi", pt: "Yuan renminbi" },
  },
  ARS: {
    symbol: { en: "AR$", pt: "AR$" },
    name: { en: "Argentine Peso", pt: "Peso argentino" },
  },
  MXN: {
    symbol: { en: "MX$", pt: "MX$" },
    name: { en: "Mexican Peso", pt: "Peso mexicano" },
  },
  CLP: {
    symbol: { en: "CL$", pt: "CL$" },
    name: { en: "Chilean Peso", pt: "Peso chileno" },
  },
  COP: {
    symbol: { en: "COL$", pt: "COL$" },
    name: { en: "Colombian Peso", pt: "Peso colombiano" },
  },
  PEN: {
    symbol: { en: "S/", pt: "S/" },
    name: { en: "Sol", pt: "Sol peruano" },
  },
  UYU: {
    symbol: { en: "$U", pt: "$U" },
    name: { en: "Peso Uruguayo", pt: "Peso uruguaio" },
  },
};

export function getManualCurrencyLabel(
  alpha: string,
  locale: Locale,
): { symbol: string; name: string } | null {
  const label = CURRENCY_LABELS[alpha];
  if (!label) return null;
  return { symbol: label.symbol[locale], name: label.name[locale] };
}
