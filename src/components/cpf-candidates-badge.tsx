"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  enumerateCpfCandidates,
  formatCpfCandidateList,
} from "@/lib/br/cpf-candidates";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/utils";

type CpfCandidatesBadgeProps = {
  rawValue: string;
  locale: Locale;
};

export function CpfCandidatesBadge({ rawValue, locale }: CpfCandidatesBadgeProps) {
  const isDesktop = useIsDesktop();
  const [copiedDigits, setCopiedDigits] = useState<string | null>(null);

  const formattedCandidates = useMemo(() => {
    const digits = enumerateCpfCandidates(rawValue);
    return formatCpfCandidateList(digits);
  }, [rawValue]);

  if (formattedCandidates.length === 0) {
    return null;
  }

  const badgeLabel = t(locale, "cpfCandidatesBadge");
  const count = formattedCandidates.length;

  async function copyCandidate(digits: string, formatted: string) {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedDigits(digits);
      window.setTimeout(() => {
        setCopiedDigits((current) => (current === digits ? null : current));
      }, 1500);
    } catch {
      setCopiedDigits(null);
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className="cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={t(locale, "cpfCandidatesAria", { count })}
      >
        <Badge
          variant="default"
          className="max-w-full whitespace-normal text-left font-sans leading-snug bg-sky-600 text-white hover:bg-sky-600/90 dark:bg-sky-500 dark:hover:bg-sky-500/90"
        >
          {badgeLabel}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        initialFocus={false}
        className="w-[min(22rem,90vw)] p-3"
      >
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {t(locale, "cpfCandidatesHeading", { count })}
        </p>
        <p className="mb-3 text-xs leading-snug text-muted-foreground">
          {t(locale, "cpfCandidatesDisclaimer")}
        </p>
        <ul
          className="flex max-h-56 flex-col gap-0.5 overflow-y-auto font-mono text-xs leading-snug"
          aria-label={t(locale, "cpfCandidatesListAria")}
        >
          {formattedCandidates.map((formatted) => {
            const digits = formatted.replace(/\D/g, "");
            const copied = copiedDigits === digits;
            return (
              <li key={formatted}>
                <button
                  type="button"
                  onClick={() => void copyCandidate(digits, formatted)}
                  className={cn(
                    "w-full rounded px-2 py-1 text-left transition-colors",
                    "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    copied && "bg-muted text-foreground",
                  )}
                  title={t(locale, "cpfCandidatesCopyHint")}
                >
                  {formatted}
                  {copied ? (
                    <span className="ml-2 font-sans text-[10px] text-muted-foreground">
                      {t(locale, "cpfCandidatesCopied")}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
