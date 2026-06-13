"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { LookupBreachBody } from "@/components/lookup/lookup-breach-body";
import { useLookupPanels } from "@/components/lookup/lookup-panels-context";
import { LookupReceitaBody } from "@/components/lookup/lookup-receita-body";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Locale } from "@/lib/brcode/labels";
import type { BreachSearchResult } from "@/lib/breach/api-search";
import { resolveLookupKind, type LookupKind } from "@/lib/lookup/kind";
import type { LookupApiResponse, LookupPanelRecord } from "@/lib/lookup/panel-types";
import type { ReceitaFetchResult } from "@/lib/receita/api-fetch";
import { t, type MessageKey } from "@/lib/i18n";
import {
  appMotionTransition,
  appPanelBodyTransition,
} from "@/lib/motion-presets";

function panelTitleKey(kind: LookupKind): MessageKey {
  switch (kind) {
    case "cnpj":
      return "lookupReceitaResults";
    case "breach":
      return "breachResults";
  }
}

function LookupPanelBody({
  locale,
  panel,
}: {
  locale: Locale;
  panel: LookupPanelRecord;
}) {
  if (panel.status === "loading") {
    return <p className="text-sm text-muted-foreground">{t(locale, "lookupLoading")}</p>;
  }

  if (panel.status === "error" || !panel.result || !panel.kind) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {panel.errorMessage ?? t(locale, "fetchFailed")}
      </p>
    );
  }

  switch (panel.kind) {
    case "cnpj":
      return (
        <LookupReceitaBody locale={locale} result={panel.result as ReceitaFetchResult} />
      );
    case "breach":
      return (
        <LookupBreachBody
          locale={locale}
          result={panel.result as BreachSearchResult}
        />
      );
  }
}

function LookupPanelCard({
  locale,
  panel,
  onToggleCollapsed,
  registerPanelElement,
  onPanelBodyExpanded,
}: {
  locale: Locale;
  panel: LookupPanelRecord;
  onToggleCollapsed: () => void;
  registerPanelElement: (id: string, element: HTMLElement | null) => void;
  onPanelBodyExpanded: (id: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const kind = panel.kind ?? resolveLookupKind(panel.query);
  const title = t(locale, panelTitleKey(kind));
  const enterTransition = appMotionTransition(prefersReducedMotion);
  const bodyTransition = appPanelBodyTransition(prefersReducedMotion);
  const chevronTransition = appMotionTransition(prefersReducedMotion);

  return (
    <motion.section
      ref={(element) => registerPanelElement(panel.id, element)}
      aria-labelledby={`lookup-panel-${panel.id}-heading`}
      className="flex scroll-mt-4 flex-col gap-2 rounded-lg border bg-muted/20 p-3"
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 8,
      }}
      animate={{ opacity: 1, y: 0 }}
      transition={enterTransition}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          id={`lookup-panel-${panel.id}-heading`}
          data-lookup-panel-heading
          tabIndex={-1}
          onClick={onToggleCollapsed}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p
            className={
              panel.collapsed
                ? "truncate font-mono text-xs text-foreground"
                : "font-mono text-xs break-all text-foreground"
            }
          >
            {panel.query}
          </p>
        </button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="h-auto shrink-0 gap-1.5 py-0.5"
          onClick={onToggleCollapsed}
          aria-expanded={!panel.collapsed}
          aria-controls={`lookup-panel-${panel.id}-body`}
          aria-label={
            panel.collapsed ? t(locale, "lookupExpand") : t(locale, "lookupCollapse")
          }
        >
          <motion.span
            className="inline-flex shrink-0"
            animate={{ rotate: panel.collapsed ? 0 : 180 }}
            transition={chevronTransition}
            aria-hidden
          >
            <ChevronDown className="size-3.5" />
          </motion.span>
          {panel.collapsed ? t(locale, "lookupExpand") : t(locale, "lookupCollapse")}
        </Button>
      </div>
      <motion.div
        id={`lookup-panel-${panel.id}-body`}
        aria-hidden={panel.collapsed}
        initial={false}
        animate={{
          height: panel.collapsed ? 0 : "auto",
          opacity: panel.collapsed ? 0 : 1,
        }}
        transition={bodyTransition}
        className="overflow-hidden"
        onAnimationComplete={() => {
          if (!panel.collapsed) {
            onPanelBodyExpanded(panel.id);
          }
        }}
      >
        <div className="flex flex-col gap-4 pt-1">
          <LookupPanelBody locale={locale} panel={panel} />
        </div>
      </motion.div>
    </motion.section>
  );
}

export function LookupPanelStack({
  locale,
  panels,
  onPanelsChange,
}: {
  locale: Locale;
  panels: LookupPanelRecord[];
  onPanelsChange: Dispatch<SetStateAction<LookupPanelRecord[]>>;
}) {
  const {
    toggleCollapsed,
    registerPanelElement,
    scrollPanelIntoView,
    notifyPanelBodyExpanded,
  } = useLookupPanels();
  const inFlightRef = useRef(new Set<string>());
  const scrolledReadyPanelRef = useRef<string | null>(null);

  useEffect(() => {
    const newest = panels.at(-1);
    if (!newest || newest.collapsed || newest.status !== "ready") return;

    const readyKey = `${newest.id}:ready`;
    if (scrolledReadyPanelRef.current === readyKey) return;
    scrolledReadyPanelRef.current = readyKey;

    requestAnimationFrame(() => scrollPanelIntoView(newest.id));
  }, [panels, scrollPanelIntoView]);

  useEffect(() => {
    const loadingPanels = panels.filter((panel) => panel.status === "loading");
    if (loadingPanels.length === 0) return;

    for (const panel of loadingPanels) {
      if (inFlightRef.current.has(panel.id)) continue;
      inFlightRef.current.add(panel.id);

      void (async () => {
        try {
          const params = new URLSearchParams({ q: panel.query });
          const response = await fetch(`/api/lookup?${params.toString()}`);
          const json = (await response.json()) as LookupApiResponse | { error?: string };

          onPanelsChange((prev) =>
            prev.map((current) => {
              if (current.id !== panel.id) return current;
              if (!response.ok || "error" in json) {
                return {
                  ...current,
                  status: "error" as const,
                  errorMessage:
                    "error" in json && json.error
                      ? json.error
                      : t(locale, "fetchFailed"),
                };
              }

              const data = json as LookupApiResponse;
              return {
                ...current,
                status: "ready" as const,
                kind: data.kind,
                result: data.result,
                errorMessage: undefined,
              };
            }),
          );
        } catch {
          onPanelsChange((prev) =>
            prev.map((current) =>
              current.id === panel.id
                ? {
                    ...current,
                    status: "error" as const,
                    errorMessage: t(locale, "fetchFailed"),
                  }
                : current,
            ),
          );
        } finally {
          inFlightRef.current.delete(panel.id);
        }
      })();
    }
  }, [locale, onPanelsChange, panels]);

  if (panels.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">
        {t(locale, "lookupPanelsSection")}
      </p>
      {panels.map((panel) => (
        <LookupPanelCard
          key={panel.id}
          locale={locale}
          panel={panel}
          onToggleCollapsed={() => toggleCollapsed(panel.id)}
          registerPanelElement={registerPanelElement}
          onPanelBodyExpanded={notifyPanelBodyExpanded}
        />
      ))}
    </div>
  );
}
