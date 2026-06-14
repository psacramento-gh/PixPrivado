"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Locale } from "@/lib/brcode/labels";
import { resolveCurrencyDisplay } from "@/lib/currency/resolve-currency-display";
import { useIsDesktop } from "@/lib/use-is-desktop";

type CurrencyBadgeProps = {
  numericCode: string;
  locale: Locale;
};

export function CurrencyBadge({ numericCode, locale }: CurrencyBadgeProps) {
  const isDesktop = useIsDesktop();
  const display = resolveCurrencyDisplay(numericCode, locale);

  if (!display) return null;

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className="cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={display.ariaLabel}
      >
        <Badge variant="secondary" className="font-sans">
          {display.symbol}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        initialFocus={false}
        className="w-fit max-w-[min(20rem,90vw)] gap-0 border-0 bg-foreground p-0 px-3 py-1.5 text-xs text-background shadow-md ring-0"
      >
        {display.name}
      </PopoverContent>
    </Popover>
  );
}
