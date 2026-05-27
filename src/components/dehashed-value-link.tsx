"use client";

import { Search } from "lucide-react";
import { Link } from "next-view-transitions";
import { buildDehashedResultsPageUrl } from "@/lib/dehashed/results-url";

type DehashedValueLinkProps = {
  displayValue: string;
  query: string;
};

export function DehashedValueLink({ displayValue, query }: DehashedValueLinkProps) {
  const resultsUrl = buildDehashedResultsPageUrl(query);

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
