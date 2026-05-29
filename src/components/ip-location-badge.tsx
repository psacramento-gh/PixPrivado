"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { IpLookupResult } from "@/lib/ip/freeip-api";
import {
  ipCompactLabel,
  ipDetailLines,
  ipOpenStreetMapUrl,
  ipTimeZonePreview,
} from "@/lib/ip/format-ip-info";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useIsDesktop } from "@/lib/use-is-desktop";

type IpFetchState =
  | { status: "loading" }
  | { status: "ok"; data: IpLookupResult }
  | { status: "error" };

const clientCache = new Map<string, Promise<IpLookupResult>>();

function fetchIpInfo(ip: string): Promise<IpLookupResult> {
  const existing = clientCache.get(ip);
  if (existing) return existing;

  const request = (async () => {
    const res = await fetch(`/api/ip?ip=${encodeURIComponent(ip)}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "IP lookup failed");
    }
    return json as IpLookupResult;
  })();

  clientCache.set(ip, request);
  request.catch(() => {
    clientCache.delete(ip);
  });

  return request;
}

type IpLocationBadgeProps = {
  ip: string;
  locale: Locale;
};

export function IpLocationBadge({ ip, locale }: IpLocationBadgeProps) {
  const isDesktop = useIsDesktop();
  const [fetchState, setFetchState] = useState<IpFetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchIpInfo(ip);
        if (!cancelled) setFetchState({ status: "ok", data });
      } catch {
        if (!cancelled) setFetchState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ip]);

  if (fetchState.status === "loading") {
    return (
      <Badge
        variant="outline"
        className="font-sans text-muted-foreground"
        aria-label={t(locale, "ipLoading")}
      >
        …
      </Badge>
    );
  }

  if (fetchState.status === "error") {
    return (
      <Badge variant="outline" className="font-sans text-muted-foreground">
        {ip}
      </Badge>
    );
  }

  const { data } = fetchState;
  const compactLabel = ipCompactLabel(data);
  const detailLines = ipDetailLines(data, locale);
  const timeZones = ipTimeZonePreview(data);
  const mapUrl = ipOpenStreetMapUrl(data);

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover={isDesktop}
        delay={0}
        closeDelay={isDesktop ? 100 : 0}
        className="cursor-pointer rounded-4xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={t(locale, "ipLocationAria")}
      >
        <Badge
          variant="default"
          className="font-sans bg-violet-600 text-white hover:bg-violet-600/90 dark:bg-violet-500 dark:hover:bg-violet-500/90"
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
          {t(locale, "ipLocationHeading", { ip: data.ipAddress })}
        </p>
        <div className="flex flex-col gap-1 text-sm leading-snug">
          {detailLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          {timeZones ? (
            <span className="text-muted-foreground">
              {t(locale, "ipTimeZones")}: {timeZones}
            </span>
          ) : null}
        </div>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {t(locale, "ipMapLink")}
        </a>
      </PopoverContent>
    </Popover>
  );
}
