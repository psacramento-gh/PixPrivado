import type { Locale } from "@/lib/brcode/labels";

/** Pick locale from geo signals: Brazil → PT-BR, otherwise English. */
export function localeFromGeoSignals(
  country: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  if (country === "BR") return "pt";

  const primary = acceptLanguage?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (primary.startsWith("pt")) return "pt";

  return "en";
}
