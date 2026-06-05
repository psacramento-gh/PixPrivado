import { ExternalLink } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type LookupGoogleLinkProps = {
  displayValue: string;
  href: string;
  locale: Locale;
};

export function LookupGoogleLink({ displayValue, href, locale }: LookupGoogleLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(locale, "googleSearchMerchantName", { name: displayValue })}
      className="inline-flex max-w-full items-start gap-1 text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
    >
      <span className="min-w-0 break-all">{displayValue}</span>
      <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
}
