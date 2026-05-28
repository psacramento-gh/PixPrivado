"use client";

import { Search } from "lucide-react";
import { Link } from "next-view-transitions";
import { buildDehashedResultsPageUrl } from "@/lib/dehashed/results-url";

type DehashedValueLinkProps = {
  displayValue: string;
  query: string;
  /** When set, breach results “back” returns here (e.g. Receita CNPJ page). */
  returnTo?: string | null;
};

export function DehashedValueLink({
  displayValue,
  query,
  returnTo,
}: DehashedValueLinkProps) {
  const resultsUrl = buildDehashedResultsPageUrl(query, 1, { returnTo });

  return (
    <Link
      href={resultsUrl}
      className="inline-flex max-w-full items-start gap-1 text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
    >
      <span className="min-w-0 break-all">{displayValue}</span>
      <Search className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
    </Link>
  );
}
