"use client";

import { FileImage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/utils";

type QrSourceFileNameProps = {
  name: string;
  locale: Locale;
  className?: string;
};

/** Truncated source image filename; hover/tap reveals the full name. */
export function QrSourceFileName({ name, locale, className }: QrSourceFileNameProps) {
  const isDesktop = useIsDesktop();
  const displayName = name.trim() || "image";
  const ariaLabel = t(locale, "sourceFileNameAria", { name: displayName });

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className={cn(
          "max-w-full shrink-0 cursor-default rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className,
        )}
        aria-label={ariaLabel}
      >
        <Badge
          variant="secondary"
          className="max-w-[min(100%,14rem)] gap-1 font-mono text-[0.65rem] font-normal"
        >
          <FileImage className="opacity-70" aria-hidden />
          <span className="truncate">{displayName}</span>
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        initialFocus={false}
        className="w-fit max-w-[min(24rem,90vw)] gap-0 border-0 bg-foreground p-0 px-3 py-1.5 font-mono text-xs text-background shadow-md ring-0"
      >
        {displayName}
      </PopoverContent>
    </Popover>
  );
}
