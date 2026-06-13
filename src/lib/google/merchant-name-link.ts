import {
  buildMerchantNameQuery,
  isAllowedMerchantLookupQuery,
  isMerchantNameIdentifier,
} from "@/lib/lookup/merchant-query";
import { buildGoogleSearchUrl } from "./search-url";

/** EMV tag 59 plain display names — exact raw value, same gating as merchant lookup. */
export function buildMerchantNameGoogleSearchUrl(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed || isMerchantNameIdentifier(trimmed)) return null;

  const query = buildMerchantNameQuery(rawValue);
  if (!query || !isAllowedMerchantLookupQuery(query)) return null;

  return buildGoogleSearchUrl(trimmed);
}
