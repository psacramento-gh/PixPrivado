import type { TlvNode } from "./parse";
import type { Locale } from "./labels";

export type QrKind = "static" | "dynamic" | "composite" | "unknown";

const PIX_GUI = "br.gov.bcb.pix";

function walk(
  nodes: TlvNode[],
  visit: (node: TlvNode, parent: TlvNode | null) => void,
  parent: TlvNode | null = null,
) {
  for (const node of nodes) {
    visit(node, parent);
    if (node.children) walk(node.children, visit, node);
  }
}

function findNode(nodes: TlvNode[], id: string): string | null {
  let found: string | null = null;
  walk(nodes, (node) => {
    if (node.id === id && !node.children?.length) {
      found = node.value;
    }
  });
  return found;
}

function findInPixMai(nodes: TlvNode[], subId: string): string | null {
  let found: string | null = null;
  walk(nodes, (node, parent) => {
    if (!parent) return;
    const pNum = parseInt(parent.id, 10);
    if (Number.isNaN(pNum) || pNum < 26 || pNum > 51) return;
    const guiChild = parent.children?.find((c) => c.id === "00");
    if (guiChild?.value.toLowerCase() !== PIX_GUI) return;
    if (node.id === subId && node.value) {
      found = node.value;
    }
  });
  return found;
}

export function hasPixGui(nodes: TlvNode[]): boolean {
  let pix = false;
  walk(nodes, (node) => {
    if (node.id === "00" && node.value.toLowerCase() === PIX_GUI) {
      pix = true;
    }
  });
  return pix;
}

export function detectQrKind(nodes: TlvNode[]): QrKind {
  const poi = findNode(nodes, "01");
  let has80 = false;
  let hasUrlIn26 = false;
  let hasUrlIn80 = false;

  walk(nodes, (node, parent) => {
    if (node.id === "80" || (parseInt(node.id, 10) >= 80 && parseInt(node.id, 10) <= 99)) {
      has80 = true;
    }
    if (node.id === "25" && parent) {
      const pNum = parseInt(parent.id, 10);
      if (!Number.isNaN(pNum) && pNum >= 26 && pNum <= 51) hasUrlIn26 = true;
      if (!Number.isNaN(pNum) && pNum >= 80 && pNum <= 99) hasUrlIn80 = true;
    }
  });

  if (has80 || hasUrlIn80) return "composite";
  if (poi === "12" || hasUrlIn26) return "dynamic";
  if (hasPixGui(nodes)) return "static";
  return "unknown";
}

export function extractLocationUrls(nodes: TlvNode[]): string[] {
  const urls: string[] = [];
  walk(nodes, (node, parent) => {
    if (node.id !== "25" || !parent) return;
    const pNum = parseInt(parent.id, 10);
    const gui = parent.children?.find((c) => c.id === "00");
    if (gui?.value.toLowerCase() !== PIX_GUI) return;
    if (!Number.isNaN(pNum) && ((pNum >= 26 && pNum <= 51) || (pNum >= 80 && pNum <= 99))) {
      if (node.value && !urls.includes(node.value)) {
        urls.push(node.value);
      }
    }
  });
  return urls;
}

export function formatAmount(amount: string, locale: Locale): string {
  const num = Number.parseFloat(amount);
  if (Number.isNaN(num)) return amount;
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function buildSummary(nodes: TlvNode[], locale: Locale): string | null {
  if (!hasPixGui(nodes)) return null;

  const kind = detectQrKind(nodes);
  const kindLabel =
    kind === "static"
      ? locale === "en"
        ? "Static QR"
        : "QR estático"
      : kind === "dynamic"
        ? locale === "en"
          ? "Dynamic QR"
          : "QR dinâmico"
        : kind === "composite"
          ? locale === "en"
            ? "Composite QR"
            : "QR composto"
          : locale === "en"
            ? "PIX QR"
            : "QR Pix";

  const amount = findNode(nodes, "54");
  const merchant = findNode(nodes, "59");
  const city = findNode(nodes, "60");
  const key = findInPixMai(nodes, "01");
  const url = findInPixMai(nodes, "25");

  const parts = [kindLabel];
  if (amount) parts.push(formatAmount(amount, locale));
  if (merchant) parts.push(merchant);
  if (city) parts.push(city);
  if (key) parts.push(key);
  if (url) parts.push(url);

  return parts.join(" · ");
}
