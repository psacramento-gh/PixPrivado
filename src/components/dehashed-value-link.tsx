"use client";

import { useCallback, useState } from "react";
import { ExternalLink } from "lucide-react";
import { buildDehashedWebSearchUrl } from "@/lib/dehashed/web-url";

type DehashedValueLinkProps = {
  displayValue: string;
  query: string;
};

export function DehashedValueLink({ displayValue, query }: DehashedValueLinkProps) {
  const [pending, setPending] = useState(false);
  const webUrl = buildDehashedWebSearchUrl(query);

  const openSearch = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/dehashed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = (await res.json()) as { url?: string };
      const target = json.url ?? webUrl;
      window.open(target, "_blank", "noopener,noreferrer");
    } catch {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    } finally {
      setPending(false);
    }
  }, [pending, query, webUrl]);

  return (
    <a
      href={webUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-busy={pending}
      className="inline-flex max-w-full items-start gap-1 text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground data-[busy=true]:pointer-events-none data-[busy=true]:opacity-70"
      data-busy={pending || undefined}
      onClick={(e) => {
        e.preventDefault();
        void openSearch();
      }}
    >
      <span className="min-w-0 break-all">{displayValue}</span>
      <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
}
