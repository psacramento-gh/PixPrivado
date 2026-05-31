import {
  parseIsoDate,
  splitCommaSeparatedValues,
  type ParsedIsoDate,
} from "@/lib/age/parse-iso-date";

export type ValueIsoDateSegment = {
  text: string;
  parsed: ParsedIsoDate;
};

/** ISO date fragments in a cell value (comma-separated lists supported). */
export function isoDateSegmentsFromValue(value: string): ValueIsoDateSegment[] {
  return splitCommaSeparatedValues(value)
    .map((segment) => {
      const parsed = parseIsoDate(segment);
      if (!parsed) return null;
      return { text: segment.trim(), parsed };
    })
    .filter((segment): segment is ValueIsoDateSegment => segment !== null);
}
