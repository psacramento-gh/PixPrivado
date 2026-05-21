export type JsonRow = { path: string; value: string };

export function flattenJson(
  data: unknown,
  prefix = "",
): JsonRow[] {
  const rows: JsonRow[] = [];

  if (data === null || data === undefined) {
    rows.push({ path: prefix || "(root)", value: String(data) });
    return rows;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const path = prefix ? `${prefix}[${index}]` : `[${index}]`;
      rows.push(...flattenJson(item, path));
    });
    return rows;
  }

  if (typeof data === "object") {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === "object") {
        rows.push(...flattenJson(value, path));
      } else {
        rows.push({ path, value: String(value) });
      }
    }
    return rows;
  }

  rows.push({ path: prefix || "(root)", value: String(data) });
  return rows;
}
