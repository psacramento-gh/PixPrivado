"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Locale } from "@/lib/brcode/labels";
import type { BreachSearchResult, HibpBreach } from "@/lib/breach/api-search";
import { HIBP_LOGO_BASE_URL } from "@/lib/breach/constants";
import { t } from "@/lib/i18n";

function formatBreachDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function formatPwnCount(count: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US").format(count);
}

function BreachCard({ breach, locale }: { breach: HibpBreach; locale: Locale }) {
  const logoUrl = breach.LogoPath
    ? `${HIBP_LOGO_BASE_URL}/${breach.LogoPath}`
    : null;

  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-background p-4">
      <div className="flex items-start gap-3">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-md bg-muted object-contain p-1"
            unoptimized
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{breach.Title}</h3>
          <p className="text-xs text-muted-foreground">
            {breach.Domain ? `${breach.Domain} · ` : null}
            {t(locale, "breachDate", {
              date: formatBreachDate(breach.BreachDate),
            })}
            {" · "}
            {t(locale, "breachAccounts", {
              count: formatPwnCount(breach.PwnCount, locale),
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {!breach.IsVerified ? (
          <Badge variant="outline" className="text-xs">
            {t(locale, "breachUnverified")}
          </Badge>
        ) : null}
        {breach.IsFabricated ? (
          <Badge variant="outline" className="text-xs">
            {t(locale, "breachFabricated")}
          </Badge>
        ) : null}
        {breach.IsSpamList ? (
          <Badge variant="outline" className="text-xs">
            {t(locale, "breachSpamList")}
          </Badge>
        ) : null}
        {breach.IsMalware ? (
          <Badge variant="outline" className="text-xs">
            {t(locale, "breachMalware")}
          </Badge>
        ) : null}
      </div>

      {breach.DataClasses.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {t(locale, "breachDataClasses")}:
          </span>{" "}
          {breach.DataClasses.join(", ")}
        </p>
      ) : null}

      {breach.Description ? (
        <div
          className="text-xs leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: breach.Description }}
        />
      ) : null}
    </article>
  );
}

export function LookupBreachBody({
  locale,
  result,
}: {
  locale: Locale;
  result: BreachSearchResult;
}) {
  if (!result.ok) {
    return (
      <div className="flex flex-col gap-2" role="alert">
        <p className="text-sm text-destructive">
          {result.error}
          {result.status ? ` (HTTP ${result.status})` : null}
        </p>
        {result.status === 503 ? (
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            <li>{t(locale, "breachPreviewHint")}</li>
            <li>{t(locale, "breachEnvHint")}</li>
          </ul>
        ) : null}
        {result.status === 429 ? (
          <p className="text-sm text-muted-foreground">{t(locale, "breachRateLimit")}</p>
        ) : null}
      </div>
    );
  }

  const showingText =
    result.breaches.length === 0
      ? t(locale, "breachNoResults")
      : t(locale, "breachShowing", { total: String(result.breaches.length) });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{showingText}</p>
      {result.breaches.length > 0 ? (
        <div className="flex flex-col gap-4">
          {result.breaches.map((breach, index) => (
            <div key={breach.Name} className="flex flex-col gap-4">
              {index > 0 ? <Separator /> : null}
              <BreachCard breach={breach} locale={locale} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
