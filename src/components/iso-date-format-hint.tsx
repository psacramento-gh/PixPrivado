"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isoDateFormatMessageKey } from "@/lib/age/iso-date-format-message";
import type { ParsedIsoDate } from "@/lib/age/parse-iso-date";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type IsoDateFormatHintProps = {
  dateText: string;
  parsed: ParsedIsoDate;
  locale: Locale;
};

/** Hover hint on an ISO date value explaining how it is shown (precision-specific). */
export function IsoDateFormatHint({
  dateText,
  parsed,
  locale,
}: IsoDateFormatHintProps) {
  const description = t(locale, isoDateFormatMessageKey(parsed));

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover
        delay={0}
        closeDelay={100}
        aria-label={description}
        className="cursor-help text-left underline decoration-dotted decoration-muted-foreground/60 underline-offset-2 hover:decoration-muted-foreground"
      >
        {dateText}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        initialFocus={false}
        className="w-fit max-w-[min(20rem,90vw)] gap-0 border-0 bg-foreground p-0 px-3 py-1.5 text-xs text-background shadow-md ring-0"
      >
        {description}
      </PopoverContent>
    </Popover>
  );
}
