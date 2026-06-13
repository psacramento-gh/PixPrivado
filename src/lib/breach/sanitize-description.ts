import DOMPurify from "isomorphic-dompurify";

const BREACH_DESCRIPTION_CONFIG = {
  ALLOWED_TAGS: ["em", "strong", "a", "p", "br"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOW_DATA_ATTR: false,
};

/** Allow-list HIBP description markup; strip scripts, images, and event handlers. */
export function sanitizeBreachDescription(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, BREACH_DESCRIPTION_CONFIG);
}
