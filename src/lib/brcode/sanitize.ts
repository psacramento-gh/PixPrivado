import { classifyPixKey } from "@/lib/pix/classify-pix-key";
import { detectQrKind, extractPixKey, hasPixGui } from "./analyze";
import { computeCrc16 } from "./crc";
import { encodeBrCode } from "./encode";
import { parseBrCode, type TlvNode } from "./parse";

const MERCHANT_NAME = "Pix";
const MERCHANT_CITY = "Brasil";
const MERCHANT_CATEGORY_CODE = "0000";
const TXID_PLACEHOLDER = "***";

const REMOVED_ROOT_TAGS = new Set(["54", "61", "63"]);
const REMOVED_PIX_CHILD_TAGS = new Set(["02", "04"]);

export type SanitizeBlockReason = "not_pix" | "not_static" | "not_evp" | "parse_error";

export type SanitizeEligibility =
  | { eligible: true }
  | { eligible: false; reason: SanitizeBlockReason };

export function getSanitizeEligibility(raw: string): SanitizeEligibility {
  const parsed = parseBrCode(raw);
  if (parsed.error) return { eligible: false, reason: "parse_error" };
  if (!hasPixGui(parsed.nodes)) return { eligible: false, reason: "not_pix" };
  if (detectQrKind(parsed.nodes) !== "static") {
    return { eligible: false, reason: "not_static" };
  }
  const key = extractPixKey(parsed.nodes);
  if (!key || classifyPixKey(key) !== "evp") {
    return { eligible: false, reason: "not_evp" };
  }
  return { eligible: true };
}

function sanitizePixMerchantChildren(children: TlvNode[]): TlvNode[] {
  const filtered = children
    .filter((child) => !REMOVED_PIX_CHILD_TAGS.has(child.id))
    .map((child) =>
      child.id === "05" ? { ...child, value: TXID_PLACEHOLDER } : child,
    );

  return filtered;
}

function sanitizeTag62Children(): TlvNode[] {
  return [{ id: "05", length: 3, value: TXID_PLACEHOLDER }];
}

function isPixMerchantNode(node: TlvNode): boolean {
  const gui = node.children?.find((child) => child.id === "00");
  return gui?.value.toLowerCase() === "br.gov.bcb.pix";
}

function sanitizeNodes(nodes: TlvNode[]): TlvNode[] {
  const sanitized: TlvNode[] = [];
  let hasTag62 = false;

  for (const node of nodes) {
    if (node.id === "63" || REMOVED_ROOT_TAGS.has(node.id)) continue;

    if (node.id === "59") {
      sanitized.push({ ...node, value: MERCHANT_NAME, length: MERCHANT_NAME.length });
      continue;
    }

    if (node.id === "60") {
      sanitized.push({ ...node, value: MERCHANT_CITY, length: MERCHANT_CITY.length });
      continue;
    }

    if (node.id === "52") {
      sanitized.push({
        ...node,
        value: MERCHANT_CATEGORY_CODE,
        length: MERCHANT_CATEGORY_CODE.length,
      });
      continue;
    }

    if (node.children?.length) {
      let children = node.children;
      if (isPixMerchantNode(node)) {
        children = sanitizePixMerchantChildren(children);
      } else if (node.id === "62") {
        hasTag62 = true;
        children = sanitizeTag62Children();
      }

      sanitized.push({ ...node, children });
      continue;
    }

    sanitized.push({ ...node });
  }

  if (!hasTag62) {
    sanitized.push({
      id: "62",
      length: 7,
      value: "",
      children: [{ id: "05", length: 3, value: TXID_PLACEHOLDER }],
    });
  }

  return sanitized;
}

export function buildPayloadWithCrc(nodes: TlvNode[]): string {
  const encoded = encodeBrCode(nodes);
  const crc = computeCrc16(`${encoded}6304`);
  return `${encoded}6304${crc}`;
}

/** True when the payload already matches the sanitized static EVP template. */
export function isPayloadAlreadySanitized(raw: string): boolean {
  const eligibility = getSanitizeEligibility(raw);
  if (!eligibility.eligible) return false;
  try {
    return sanitizeStaticPixPayload(raw) === raw.trim();
  } catch {
    return false;
  }
}

/** Strips personal data from a static PIX payload while keeping the EVP key. */
export function sanitizeStaticPixPayload(raw: string): string {
  const eligibility = getSanitizeEligibility(raw);
  if (!eligibility.eligible) {
    throw new Error(`Cannot sanitize payload: ${eligibility.reason}`);
  }

  const parsed = parseBrCode(raw);
  const sanitizedNodes = sanitizeNodes(parsed.nodes);
  return buildPayloadWithCrc(sanitizedNodes);
}
