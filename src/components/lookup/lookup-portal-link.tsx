import { ExternalLink } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type LookupPortalLinkProps = {
  displayValue: string;
  href: string;
  locale: Locale;
};

function BrazilFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" aria-hidden className={className}>
      <rect width="20" height="14" fill="#009b3a" rx="1" />
      <path fill="#fedf00" d="M10 1.2 18.2 7 10 12.8 1.8 7Z" />
      <circle cx="10" cy="7" r="3.2" fill="#002776" />
      <path
        fill="#fff"
        d="M6.8 7a4.5 4.5 0 0 1 6.4-3.5 3 3 0 0 0-5.2 2.2A3.2 3.2 0 0 0 6.8 7z"
      />
    </svg>
  );
}

export function LookupPortalLink({ displayValue, href, locale }: LookupPortalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(locale, "portalTransparenciaSearch", { name: displayValue })}
      className="inline-flex max-w-full items-start gap-1 text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
    >
      <span className="min-w-0 break-all">{displayValue}</span>
      <BrazilFlagIcon className="mt-0.5 size-3.5 shrink-0 rounded-[2px]" />
      <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
}
