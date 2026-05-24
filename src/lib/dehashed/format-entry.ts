export function formatEntryField(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

const DISPLAY_FIELDS = [
  "email",
  "username",
  "name",
  "phone",
  "ip_address",
  "address",
  "company",
  "url",
  "database_name",
  "password",
  "hashed_password",
] as const;

export function entryRows(
  entry: Record<string, unknown>,
): Array<{ field: string; value: string }> {
  const rows: Array<{ field: string; value: string }> = [];
  for (const field of DISPLAY_FIELDS) {
    const formatted = formatEntryField(entry[field]);
    if (formatted) rows.push({ field, value: formatted });
  }
  for (const [field, value] of Object.entries(entry)) {
    if ((DISPLAY_FIELDS as readonly string[]).includes(field)) continue;
    const formatted = formatEntryField(value);
    if (formatted) rows.push({ field, value: formatted });
  }
  return rows;
}
