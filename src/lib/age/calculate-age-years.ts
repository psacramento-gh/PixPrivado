import type { ParsedIsoDate } from "@/lib/age/parse-iso-date";

export type AgeYearsResult = {
  years: number;
  approximate: boolean;
};

const MAX_AGE_YEARS = 150;

function isPlausibleAge(years: number): boolean {
  return years >= 0 && years <= MAX_AGE_YEARS;
}

/** Returns completed full years since the parsed ISO date (approximate for partial dates). */
export function calculateAgeYears(
  parsed: ParsedIsoDate,
  referenceDate: Date = new Date(),
): AgeYearsResult | null {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();

  if (parsed.precision === "year") {
    const years = refYear - parsed.year;
    return isPlausibleAge(years) ? { years, approximate: true } : null;
  }

  if (parsed.precision === "month") {
    let years = refYear - parsed.year;
    if (refMonth < parsed.month) years -= 1;
    return isPlausibleAge(years) ? { years, approximate: true } : null;
  }

  let years = refYear - parsed.year;
  if (refMonth < parsed.month || (refMonth === parsed.month && refDay < parsed.day)) {
    years -= 1;
  }
  return isPlausibleAge(years) ? { years, approximate: false } : null;
}
