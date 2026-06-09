import type { TlvNode } from "./parse";

function encodeTlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

function encodeNode(node: TlvNode): string {
  const value = node.children?.length
    ? node.children.map(encodeNode).join("")
    : node.value;
  return encodeTlv(node.id, value);
}

/** Serializes parsed TLV nodes back into an EMV BR Code string (without CRC). */
export function encodeBrCode(nodes: TlvNode[]): string {
  return nodes.map(encodeNode).join("");
}
