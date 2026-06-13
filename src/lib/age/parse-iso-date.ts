export type ParsedIsoDate =
  | { precision: "day"; year: number; month: number; day: number }
  | { precision: "month"; year: number; month: number }
  | { precision: "year"; year: number };

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** Parses ISO-like date strings: YYYY-MM-DD, YYYY-MM, or YYYY. */
export function parseIsoDate(value: string): ParsedIsoDate | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const fullMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (fullMatch) {
    const year = Number(fullMatch[1]);
    const month = Number(fullMatch[2]);
    const day = Number(fullMatch[3]);
    if (month < 1 || month > 12 || !isValidCalendarDate(year, month, day)) {
      return null;
    }
    return { precision: "day", year, month, day };
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]);
    if (month < 1 || month > 12) return null;
    return { precision: "month", year, month };
  }

  const yearMatch = /^(\d{4})$/.exec(trimmed);
  if (yearMatch) {
    return { precision: "year", year: Number(yearMatch[1]) };
  }

  return null;
}

/** Splits comma-separated values from multi-value fields. */
export function splitCommaSeparatedValues(value: string): string[] {
  if (!value.includes(",")) return [value];
  return value.split(/\s*,\s*/).filter(Boolean);
}
