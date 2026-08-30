"use client";

import { Search } from "lucide-react";
import { useLookupPanels } from "@/components/lookup/lookup-panels-context";
import { useOfflineMode } from "@/components/offline-mode-provider";

type LookupValueButtonProps = {
  displayValue: string;
  query: string;
};

export function LookupValueButton({ displayValue, query }: LookupValueButtonProps) {
  const { openLookup } = useLookupPanels();
  const { networkDisabled } = useOfflineMode();

  if (networkDisabled) {
    return <span className="break-all">{displayValue}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => openLookup(query)}
      className="inline-flex max-w-full items-start gap-1 text-left text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
    >
      <span className="min-w-0 break-all">{displayValue}</span>
      <Search className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
  );
}
