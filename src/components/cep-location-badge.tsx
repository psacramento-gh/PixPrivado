"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CepLookupResult } from "@/lib/br/cep-api";
import {
  cepAddressLines,
  cepCompactLabel,
  cepOpenStreetMapUrl,
} from "@/lib/br/format-cep-address";
import { formatCepDigits } from "@/lib/br/normalize-cep";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useIsDesktop } from "@/lib/use-is-desktop";

type CepFetchState =
  | { status: "loading" }
  | { status: "ok"; data: CepLookupResult }
  | { status: "error" };

const clientCache = new Map<string, Promise<CepLookupResult>>();

function fetchCepInfo(cepDigits: string): Promise<CepLookupResult> {
  const existing = clientCache.get(cepDigits);
  if (existing) return existing;

  const request = (async () => {
    const res = await fetch(`/api/cep?cep=${cepDigits}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "CEP lookup failed");
    }
    return json as CepLookupResult;
  })();

  clientCache.set(cepDigits, request);
  request.catch(() => {
    clientCache.delete(cepDigits);
  });

  return request;
}

type CepLocationBadgeProps = {
  cepDigits: string;
  locale: Locale;
};

export function CepLocationBadge({ cepDigits, locale }: CepLocationBadgeProps) {
  const isDesktop = useIsDesktop();
  const [fetchState, setFetchState] = useState<CepFetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchCepInfo(cepDigits);
        if (!cancelled) setFetchState({ status: "ok", data });
      } catch {
        if (!cancelled) setFetchState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cepDigits]);

  if (fetchState.status === "loading") {
    return (
      <Badge
        variant="outline"
        className="font-sans text-muted-foreground"
        aria-label={t(locale, "cepLoading")}
      >
        …
      </Badge>
    );
  }

  if (fetchState.status === "error") {
    return (
      <Badge variant="outline" className="font-sans text-muted-foreground">
        {formatCepDigits(cepDigits)}
      </Badge>
    );
  }

  const { data } = fetchState;
  const compactLabel = cepCompactLabel(data, locale);
  const addressLines = cepAddressLines(data, locale);
  const mapUrl = cepOpenStreetMapUrl(data);

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className="cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={t(locale, "cepLocationAria")}
      >
        <Badge
          variant="default"
          className="font-sans bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-500 dark:hover:bg-emerald-500/90"
        >
          {compactLabel}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        initialFocus={false}
        className="w-[min(20rem,90vw)] p-3"
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {t(locale, "cepLocationHeading", {
            cep: formatCepDigits(cepDigits),
          })}
        </p>
        <address className="flex flex-col gap-1 text-sm leading-snug not-italic">
          {addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {t(locale, "cepMapLink")}
        </a>
      </PopoverContent>
    </Popover>
  );
}
