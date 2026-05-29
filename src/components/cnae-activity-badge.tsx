"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CnaeSubclassLookupResult } from "@/lib/br/cnae-api";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useIsDesktop } from "@/lib/use-is-desktop";

type CnaeFetchState =
  | { status: "loading" }
  | { status: "ok"; data: CnaeSubclassLookupResult }
  | { status: "error" };

const clientCache = new Map<string, Promise<CnaeSubclassLookupResult>>();

function fetchCnaeInfo(cnaeDigits: string): Promise<CnaeSubclassLookupResult> {
  const existing = clientCache.get(cnaeDigits);
  if (existing) return existing;

  const request = (async () => {
    const res = await fetch(`/api/cnae?code=${cnaeDigits}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "CNAE lookup failed");
    }
    return json as CnaeSubclassLookupResult;
  })();

  clientCache.set(cnaeDigits, request);
  request.catch(() => {
    clientCache.delete(cnaeDigits);
  });

  return request;
}

type CnaeActivityBadgeProps = {
  cnaeDigits: string;
  locale: Locale;
};

export function CnaeActivityBadge({ cnaeDigits, locale }: CnaeActivityBadgeProps) {
  const isDesktop = useIsDesktop();
  const [fetchState, setFetchState] = useState<CnaeFetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchCnaeInfo(cnaeDigits);
        if (!cancelled) setFetchState({ status: "ok", data });
      } catch {
        if (!cancelled) setFetchState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cnaeDigits]);

  if (fetchState.status === "loading") {
    return (
      <Badge
        variant="outline"
        className="font-sans text-muted-foreground"
        aria-label={t(locale, "cnaeLoading")}
      >
        …
      </Badge>
    );
  }

  if (fetchState.status === "error") {
    return null;
  }

  const { data } = fetchState;
  const activityLabel = data.descricaoFormatted;
  const badgeLabel = t(locale, "cnaeActivityBadge");

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className="cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={t(locale, "cnaeActivityAria", {
          code: cnaeDigits,
          descricao: activityLabel,
        })}
      >
        <Badge
          variant="default"
          className="shrink-0 font-sans bg-violet-600 text-white hover:bg-violet-600/90 dark:bg-violet-500 dark:hover:bg-violet-500/90"
        >
          {badgeLabel}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        initialFocus={false}
        className="w-[min(22rem,90vw)] p-3"
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {t(locale, "cnaeActivityHeading", { code: cnaeDigits })}
        </p>
        <p className="text-sm leading-snug">{activityLabel}</p>
        {data.classe ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t(locale, "cnaeClassLabel", {
              id: data.classe.id,
              descricao: data.classe.descricao,
            })}
          </p>
        ) : null}
        {data.atividades.length > 0 ? (
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {t(locale, "cnaeActivitiesLabel")}
            </p>
            <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto text-xs leading-snug">
              {data.atividades.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
