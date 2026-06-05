/** Query param carrying the raw EMV / PIX payload for shareable decoder links. */
export const DECODER_PAYLOAD_PARAM = "p";

export function buildDecoderSharePath(payload: string): string {
  const trimmed = payload.trim();
  if (!trimmed) return "/";

  const params = new URLSearchParams();
  params.set(DECODER_PAYLOAD_PARAM, trimmed);
  return `/?${params.toString()}`;
}

export function buildDecoderShareUrl(
  payload: string,
  origin = "",
): string {
  const path = buildDecoderSharePath(payload);
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function parseDecoderPayloadFromSearch(
  search: string | URLSearchParams,
): string | null {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const raw = params.get(DECODER_PAYLOAD_PARAM);
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  return trimmed || null;
}

export function truncateShareUrlForDisplay(
  url: string,
  maxLength = 56,
): string {
  if (url.length <= maxLength) return url;

  const ellipsis = "…";
  const keep = maxLength - ellipsis.length;
  const head = Math.ceil(keep / 2);
  const tail = Math.floor(keep / 2);
  return `${url.slice(0, head)}${ellipsis}${url.slice(-tail)}`;
}
