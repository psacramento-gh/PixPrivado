"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseMccCode } from "@/lib/br/mcc/lookup";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useIsDesktop } from "@/lib/use-is-desktop";

type MccCategoryBadgeProps = {
  mccCode: string;
  description: string;
  locale: Locale;
};

export function MccCategoryBadge({
  mccCode,
  description,
  locale,
}: MccCategoryBadgeProps) {
  const isDesktop = useIsDesktop();
  const formattedCode = parseMccCode(mccCode) ?? mccCode;

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className="max-w-[min(100%,14rem)] cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={t(locale, "mccCategoryAria", { code: formattedCode })}
      >
        <Badge
          variant="default"
          className="max-w-[14rem] truncate font-sans bg-amber-600 text-white hover:bg-amber-600/90 dark:bg-amber-500 dark:hover:bg-amber-500/90"
        >
          {description}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        initialFocus={false}
        className="w-[min(20rem,90vw)] p-3"
      >
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {t(locale, "mccCategoryHeading", { code: formattedCode })}
        </p>
        <p className="text-sm leading-snug">{description}</p>
      </PopoverContent>
    </Popover>
  );
}
