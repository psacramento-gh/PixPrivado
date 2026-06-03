"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MunicipiosSearchResult } from "@/lib/br/municipios-api";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useIsDesktop } from "@/lib/use-is-desktop";

type MunicipiosFetchState =
  | { status: "loading" }
  | { status: "ok"; data: MunicipiosSearchResult }
  | { status: "error" };

const clientCache = new Map<string, Promise<MunicipiosSearchResult>>();

function fetchMunicipios(cityQuery: string): Promise<MunicipiosSearchResult> {
  const existing = clientCache.get(cityQuery);
  if (existing) return existing;

  const request = (async () => {
    const res = await fetch(`/api/municipios?q=${encodeURIComponent(cityQuery)}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "Municipios lookup failed");
    }
    return json as MunicipiosSearchResult;
  })();

  clientCache.set(cityQuery, request);
  request.catch(() => {
    clientCache.delete(cityQuery);
  });

  return request;
}

function badgeLabel(data: MunicipiosSearchResult): string {
  if (data.matches.length === 1) {
    const match = data.matches[0]!;
    return `${match.uf} · ${match.nomeFormatted}`;
  }
  return `IBGE · ${data.matches.length}`;
}

type IbgeMunicipiosBadgeProps = {
  cityQuery: string;
  displayQuery: string;
  locale: Locale;
};

export function IbgeMunicipiosBadge({
  cityQuery,
  displayQuery,
  locale,
}: IbgeMunicipiosBadgeProps) {
  const isDesktop = useIsDesktop();
  const [fetchState, setFetchState] = useState<MunicipiosFetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchMunicipios(cityQuery);
        if (!cancelled) setFetchState({ status: "ok", data });
      } catch {
        if (!cancelled) setFetchState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cityQuery]);

  if (fetchState.status === "loading") {
    return (
      <Badge
        variant="outline"
        className="font-sans text-muted-foreground"
        aria-label={t(locale, "ibgeMunicipiosLoading")}
      >
        …
      </Badge>
    );
  }

  if (fetchState.status === "error") {
    return null;
  }

  const { data } = fetchState;
  const label = badgeLabel(data);

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className="cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={t(locale, "ibgeMunicipiosAria", {
          count: String(data.matches.length),
          query: displayQuery,
        })}
      >
        <Badge
          variant="default"
          className="font-sans bg-amber-600 text-white hover:bg-amber-600/90 dark:bg-amber-500 dark:hover:bg-amber-500/90"
        >
          {label}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        initialFocus={false}
        className="w-[min(22rem,90vw)] max-h-64 overflow-y-auto p-3"
      >
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {t(locale, "ibgeMunicipiosHeading", { query: displayQuery })}
        </p>
        <p className="mb-2 text-xs leading-snug text-muted-foreground">
          {t(locale, "ibgeMunicipiosDisclaimer")}
        </p>
        <ul className="flex flex-col gap-1 text-sm leading-snug">
          {data.matches.map((match) => (
            <li key={match.id}>
              {match.nomeFormatted} — {match.uf}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {t(locale, "ibgeMunicipiosSource")}
        </p>
      </PopoverContent>
    </Popover>
  );
}
