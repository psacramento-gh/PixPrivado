import { getTagLabel, type Locale } from "./labels";
import type { flattenNodes } from "./parse";

export type StructuredTableRow = ReturnType<typeof flattenNodes>[number];

function escapeTsvCell(value: string): string {
  if (/[\t\n\r"]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

/** Builds TSV for spreadsheet paste using localized labels and raw TLV values. */
export function buildStructuredTableTsv(
  rows: StructuredTableRow[],
  locale: Locale,
  options?: {
    includeHeader?: boolean;
    labelHeader?: string;
    valueHeader?: string;
  },
): string {
  const {
    includeHeader = true,
    labelHeader = "Label",
    valueHeader = "Value",
  } = options ?? {};

  const lines: string[] = [];

  if (includeHeader) {
    lines.push(
      `${escapeTsvCell(labelHeader)}\t${escapeTsvCell(valueHeader)}`,
    );
  }

  for (const row of rows) {
    const label = getTagLabel(row.id, row.parentId, locale);
    const value = row.isTemplate ? "" : row.value;
    lines.push(`${escapeTsvCell(label)}\t${escapeTsvCell(value)}`);
  }

  return lines.join("\n");
}
