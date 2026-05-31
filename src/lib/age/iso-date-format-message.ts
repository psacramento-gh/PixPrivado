import type { ParsedIsoDate } from "@/lib/age/parse-iso-date";
import type { MessageKey } from "@/lib/i18n";

export function isoDateFormatMessageKey(
  parsed: ParsedIsoDate,
): Extract<
  MessageKey,
  "isoDateFormatDay" | "isoDateFormatMonth" | "isoDateFormatYear"
> {
  switch (parsed.precision) {
    case "day":
      return "isoDateFormatDay";
    case "month":
      return "isoDateFormatMonth";
    case "year":
      return "isoDateFormatYear";
  }
}
