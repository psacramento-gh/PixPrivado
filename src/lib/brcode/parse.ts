import { validateCrc, type CrcValidation } from "./crc";

export type TlvNode = {
  id: string;
  length: number;
  value: string;
  children?: TlvNode[];
};

export type ParseResult = {
  payload: string;
  nodes: TlvNode[];
  crc: CrcValidation;
  error?: string;
};

function isNestedTemplate(id: string): boolean {
  const n = parseInt(id, 10);
  if (Number.isNaN(n)) return false;
  if (id === "62") return true;
  if (n >= 26 && n <= 51) return true;
  if (n >= 80 && n <= 99) return true;
  return false;
}

function parseTlv(data: string): { nodes: TlvNode[]; error?: string } {
  const nodes: TlvNode[] = [];
  let offset = 0;

  while (offset < data.length) {
    if (offset + 4 > data.length) {
      return { nodes, error: "Incomplete TLV header" };
    }

    const id = data.slice(offset, offset + 2);
    const lengthRaw = data.slice(offset + 2, offset + 4);
    const length = parseInt(lengthRaw, 10);

    if (Number.isNaN(length) || length < 0) {
      return { nodes, error: `Invalid length for tag ${id}` };
    }

    const valueStart = offset + 4;
    const valueEnd = valueStart + length;
    if (valueEnd > data.length) {
      return { nodes, error: `Value out of bounds for tag ${id}` };
    }

    const value = data.slice(valueStart, valueEnd);
    const node: TlvNode = { id, length, value };

    if (isNestedTemplate(id)) {
      const nested = parseTlv(value);
      if (nested.error) {
        return { nodes, error: nested.error };
      }
      node.children = nested.nodes;
    }

    nodes.push(node);
    offset = valueEnd;
  }

  return { nodes };
}

export function parseBrCode(raw: string): ParseResult {
  const payload = raw.trim();
  if (!payload) {
    return {
      payload: "",
      nodes: [],
      crc: { valid: false, expected: "", actual: "", present: false },
      error: "Empty payload",
    };
  }

  const parsed = parseTlv(payload);
  const crc = validateCrc(payload);

  return {
    payload,
    nodes: parsed.nodes,
    crc,
    error: parsed.error,
  };
}

export function flattenNodes(
  nodes: TlvNode[],
  parentPath = "",
  parentId: string | null = null,
): Array<{
  path: string;
  id: string;
  parentId: string | null;
  length: number;
  value: string;
  depth: number;
  isTemplate: boolean;
}> {
  const rows: Array<{
    path: string;
    id: string;
    parentId: string | null;
    length: number;
    value: string;
    depth: number;
    isTemplate: boolean;
  }> = [];

  for (const node of nodes) {
    const path = parentPath ? `${parentPath}.${node.id}` : node.id;
    const hasChildren = Boolean(node.children?.length);
    rows.push({
      path,
      id: node.id,
      parentId,
      length: node.length,
      value: node.value,
      depth: path.split(".").length - 1,
      isTemplate: hasChildren,
    });
    if (hasChildren) {
      rows.push(...flattenNodes(node.children!, path, node.id));
    }
  }

  return rows;
}
