"use client";

import { ClipboardCopy } from "lucide-react";
import { useMemo, useState } from "react";
import { LookupExternalLink } from "@/components/lookup/lookup-external-link";
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
import { buildPessoaFisicaPortalUrlFromCpfDigits } from "@/lib/transparencia/portal-link";
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

  const candidates = useMemo(() => {
    const digitsList = enumerateCpfCandidates(rawValue);
    const formattedList = formatCpfCandidateList(digitsList);
    return digitsList.map((digits, index) => ({
      digits,
      formatted: formattedList[index],
      portalUrl: buildPessoaFisicaPortalUrlFromCpfDigits(digits),
    }));
  }, [rawValue]);

  if (candidates.length === 0) {
    return null;
  }

  const badgeLabel = t(locale, "cpfCandidatesBadge");
  const count = candidates.length;

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
          {candidates.map(({ digits, formatted, portalUrl }) => {
            const copied = copiedDigits === digits;
            return (
              <li
                key={digits}
                className={cn(
                  "flex items-start gap-1 rounded px-2 py-1",
                  copied && "bg-muted",
                )}
              >
                {portalUrl ? (
                  <LookupExternalLink displayValue={formatted} href={portalUrl} />
                ) : (
                  <span className="min-w-0 break-all">{formatted}</span>
                )}
                <button
                  type="button"
                  onClick={() => void copyCandidate(digits, formatted)}
                  className={cn(
                    "mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground transition-colors",
                    "hover:bg-muted-foreground/15 hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                  title={t(locale, "cpfCandidatesCopyHint")}
                  aria-label={t(locale, "cpfCandidatesCopyHint")}
                >
                  <ClipboardCopy className="size-3.5" aria-hidden />
                  <span className="sr-only">
                    {copied ? t(locale, "cpfCandidatesCopied") : formatted}
                  </span>
                </button>
                {copied ? (
                  <span className="sr-only" aria-live="polite">
                    {t(locale, "cpfCandidatesCopied")}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
