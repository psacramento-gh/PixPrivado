import { hasFlag } from "country-flag-icons";
import { normalizeIso3166Alpha2 } from "./iso3166";

/** Same-origin SVG flag URL served from /api/flags. */
export function countryCodeToFlagSvgUrl(alpha2Code: string): string | null {
  const alpha2 = normalizeIso3166Alpha2(alpha2Code);
  if (!alpha2 || !hasFlag(alpha2)) return null;

  return `/api/flags/${alpha2}`;
}
