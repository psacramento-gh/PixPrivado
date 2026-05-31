"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isBirthField } from "@/lib/age/is-birth-field";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type DehashedFieldLabelProps = {
  field: string;
  locale: Locale;
};

/** Field name in DeHashed tables; birth-related names get a hover explanation. */
export function DehashedFieldLabel({ field, locale }: DehashedFieldLabelProps) {
  if (!isBirthField(field)) {
    return <>{field}</>;
  }

  const description = t(locale, "birthFieldTooltip");

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
        {field}
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
