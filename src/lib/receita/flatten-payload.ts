export type FlatPayloadRow = {
  field: string;
  value: string;
};

function appendScalar(rows: FlatPayloadRow[], field: string, value: unknown): void {
  if (value === null || value === undefined) {
    rows.push({ field, value: "" });
    return;
  }
  if (typeof value === "boolean") {
    rows.push({ field, value: value ? "true" : "false" });
    return;
  }
  rows.push({ field, value: String(value) });
}

export function flattenPayload(value: unknown, prefix = ""): FlatPayloadRow[] {
  const rows: FlatPayloadRow[] = [];

  if (value === null || value === undefined) {
    if (prefix) appendScalar(rows, prefix, value);
    return rows;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      if (prefix) appendScalar(rows, prefix, "[]");
      return rows;
    }
    value.forEach((item, index) => {
      const path = prefix ? `${prefix}[${index}]` : `[${index}]`;
      rows.push(...flattenPayload(item, path));
    });
    return rows;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      if (prefix) appendScalar(rows, prefix, "{}");
      return rows;
    }
    for (const [key, nested] of entries) {
      const path = prefix ? `${prefix}.${key}` : key;
      rows.push(...flattenPayload(nested, path));
    }
    return rows;
  }

  if (prefix) appendScalar(rows, prefix, value);
  return rows;
}
