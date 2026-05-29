import { calculateAgeYears } from "@/lib/age/calculate-age-years";
import {
  parseIsoDate,
  splitCommaSeparatedValues,
  type ParsedIsoDate,
} from "@/lib/age/parse-iso-date";

export type ValueAgeSegment = {
  text: string;
  parsed: ParsedIsoDate;
  age: number;
  approximate: boolean;
};

export function ageFromIsoValue(value: string): ValueAgeSegment | null {
  const parsed = parseIsoDate(value);
  if (!parsed) return null;

  const ageResult = calculateAgeYears(parsed);
  if (!ageResult) return null;

  return {
    text: value.trim(),
    parsed,
    age: ageResult.years,
    approximate: ageResult.approximate,
  };
}

export function ageSegmentsFromValue(value: string): ValueAgeSegment[] {
  return splitCommaSeparatedValues(value)
    .map((segment) => ageFromIsoValue(segment))
    .filter((segment): segment is ValueAgeSegment => segment !== null);
}
