"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getBrazilianStateDisplayName } from "@/lib/br/brazilian-state-names";
import type { DddLookupResult } from "@/lib/br/ddd-api";
import { formatCityName } from "@/lib/br/format-city-name";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type DddFetchState =
  | { status: "loading" }
  | { status: "ok"; data: DddLookupResult }
  | { status: "error" };

const clientCache = new Map<number, Promise<DddLookupResult>>();

function fetchDddInfo(ddd: number): Promise<DddLookupResult> {
  const existing = clientCache.get(ddd);
  if (existing) return existing;

  const request = (async () => {
    const res = await fetch(`/api/ddd?ddd=${ddd}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "DDD lookup failed");
    }
    return json as DddLookupResult;
  })();

  clientCache.set(ddd, request);
  request.catch(() => {
    clientCache.delete(ddd);
  });

  return request;
}

type PhoneDddBadgesProps = {
  ddd: number;
  locale: Locale;
};

export function PhoneDddBadges({ ddd, locale }: PhoneDddBadgesProps) {
  const [fetchState, setFetchState] = useState<DddFetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchDddInfo(ddd);
        if (!cancelled) setFetchState({ status: "ok", data });
      } catch {
        if (!cancelled) setFetchState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ddd]);

  if (fetchState.status === "loading") {
    return (
      <Badge
        variant="outline"
        className="font-sans text-muted-foreground"
        aria-label={t(locale, "dddLoading")}
      >
        …
      </Badge>
    );
  }

  if (fetchState.status === "error") {
    return (
      <Badge variant="outline" className="font-sans text-muted-foreground">
        DDD {ddd}
      </Badge>
    );
  }

  const { state, cities } = fetchState.data;
  const stateLabel = getBrazilianStateDisplayName(state, locale);
  const sortedCities = [...cities]
    .map(formatCityName)
    .sort((a, b) => a.localeCompare(b, locale === "pt" ? "pt-BR" : "en"));

  return (
    <>
      <Badge
        variant="default"
        className="font-sans bg-sky-600 text-white hover:bg-sky-600/90 dark:bg-sky-500 dark:hover:bg-sky-500/90"
      >
        {stateLabel}
      </Badge>
      <Popover>
        <PopoverTrigger
          type="button"
          className="cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label={t(locale, "dddCitiesAria", { count: String(sortedCities.length) })}
        >
          <Badge
            variant="secondary"
            className="font-sans bg-violet-600/15 text-violet-900 hover:bg-violet-600/25 dark:bg-violet-400/20 dark:text-violet-100"
          >
            {t(locale, "dddCities")}
          </Badge>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          initialFocus={false}
          className="w-[min(20rem,90vw)] max-h-64 overflow-y-auto p-3"
        >
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t(locale, "dddCitiesHeading", { ddd: String(ddd), state: stateLabel })}
          </p>
          <ul className="flex flex-col gap-1 text-sm leading-snug">
            {sortedCities.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </>
  );
}
