import {
  buildMerchantNameQuery,
  isAllowedDehashedQuery,
  isMerchantNameIdentifier,
} from "@/lib/dehashed/build-query";
import { buildGoogleSearchUrl } from "./search-url";

/** EMV tag 59 plain display names — exact raw value, same gating as Dehashed lookup. */
export function buildMerchantNameGoogleSearchUrl(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed || isMerchantNameIdentifier(trimmed)) return null;

  const query = buildMerchantNameQuery(rawValue);
  if (!query || !isAllowedDehashedQuery(query)) return null;

  return buildGoogleSearchUrl(trimmed);
}
