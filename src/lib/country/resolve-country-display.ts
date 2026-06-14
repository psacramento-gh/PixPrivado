import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { getManualCountryLabel } from "./country-labels";
import { countryCodeToFlagEmoji } from "./country-code-to-flag";
import {
  lookupIso3166EnglishName,
  normalizeIso3166Alpha2,
} from "./iso3166";

export type CountryDisplay = {
  alpha2: string;
  flag: string;
  name: string;
  ariaLabel: string;
};

export function resolveCountryDisplay(
  alpha2Code: string,
  locale: Locale,
): CountryDisplay | null {
  const alpha2 = normalizeIso3166Alpha2(alpha2Code);
  if (!alpha2) return null;

  const englishName = lookupIso3166EnglishName(alpha2);
  if (!englishName) return null;

  const flag = countryCodeToFlagEmoji(alpha2);
  if (!flag) return null;

  const manual = getManualCountryLabel(alpha2, locale);
  const name =
    manual?.name ??
    (locale === "en"
      ? englishName
      : t(locale, "countryNameFallback", { alpha2, englishName }));

  return {
    alpha2,
    flag,
    name,
    ariaLabel: t(locale, "countryAriaLabel", { name, alpha2 }),
  };
}

export function isCountryCodeRow(row: {
  id: string;
  parentId: string | null;
}): boolean {
  return row.id === "58" && row.parentId === null;
}
