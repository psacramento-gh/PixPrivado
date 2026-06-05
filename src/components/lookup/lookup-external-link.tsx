import { ExternalLink } from "lucide-react";

type LookupExternalLinkProps = {
  displayValue: string;
  href: string;
};

export function LookupExternalLink({ displayValue, href }: LookupExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-start gap-1 text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
    >
      <span className="min-w-0 break-all">{displayValue}</span>
      <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
}
