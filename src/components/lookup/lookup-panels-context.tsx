"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { normalizeLookupQueryKey } from "@/lib/lookup/normalize-query-key";
import type { LookupPanelRecord } from "@/lib/lookup/panel-types";
import {
  PANEL_SCROLL_RETRY_DELAYS_MS,
  scrollToPanelElement,
} from "@/lib/lookup/scroll-to-panel";

type PendingPanelScroll = {
  id: string;
  waitForExpand: boolean;
};

type LookupPanelsContextValue = {
  panels: LookupPanelRecord[];
  openLookup: (query: string) => void;
  toggleCollapsed: (id: string) => void;
  clearPanels: () => void;
  registerPanelElement: (id: string, element: HTMLElement | null) => void;
  scrollPanelIntoView: (id: string) => void;
  notifyPanelBodyExpanded: (id: string) => void;
};

const LookupPanelsContext = createContext<LookupPanelsContextValue | null>(null);

function createPanelId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lookup-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function LookupPanelsProvider({
  panels,
  onPanelsChange,
  children,
}: {
  panels: LookupPanelRecord[];
  onPanelsChange: Dispatch<SetStateAction<LookupPanelRecord[]>>;
  children: ReactNode;
}) {
  const panelElementsRef = useRef(new Map<string, HTMLElement>());
  const pendingScrollRef = useRef<PendingPanelScroll | null>(null);
  const scrollRetryTimersRef = useRef<number[]>([]);

  const clearScrollRetries = useCallback(() => {
    for (const timer of scrollRetryTimersRef.current) {
      window.clearTimeout(timer);
    }
    scrollRetryTimersRef.current = [];
  }, []);

  const performPanelScroll = useCallback((id: string) => {
    const element = panelElementsRef.current.get(id);
    if (!element) return false;

    scrollToPanelElement(element, { behavior: "auto" });
    const heading = element.querySelector<HTMLElement>("[data-lookup-panel-heading]");
    heading?.focus({ preventScroll: true });
    return true;
  }, []);

  const scrollPanelIntoView = useCallback(
    (id: string) => {
      performPanelScroll(id);
    },
    [performPanelScroll],
  );

  const commitPanelScroll = useCallback(
    (id: string, waitForExpand: boolean) => {
      if (pendingScrollRef.current?.id !== id) return;

      clearScrollRetries();
      const delays = waitForExpand
        ? PANEL_SCROLL_RETRY_DELAYS_MS.afterExpand
        : PANEL_SCROLL_RETRY_DELAYS_MS.immediate;

      for (const [index, delay] of delays.entries()) {
        const timer = window.setTimeout(() => {
          if (pendingScrollRef.current?.id !== id) return;
          if (!performPanelScroll(id)) return;

          if (index === delays.length - 1) {
            pendingScrollRef.current = null;
          }
        }, delay);
        scrollRetryTimersRef.current.push(timer);
      }
    },
    [clearScrollRetries, performPanelScroll],
  );

  const requestPanelScroll = useCallback(
    (id: string, waitForExpand: boolean) => {
      clearScrollRetries();
      pendingScrollRef.current = { id, waitForExpand };
      commitPanelScroll(id, waitForExpand);
    },
    [clearScrollRetries, commitPanelScroll],
  );

  const notifyPanelBodyExpanded = useCallback(
    (id: string) => {
      if (pendingScrollRef.current?.id !== id || !pendingScrollRef.current.waitForExpand) {
        return;
      }
      commitPanelScroll(id, true);
    },
    [commitPanelScroll],
  );

  useEffect(() => () => clearScrollRetries(), [clearScrollRetries]);

  const registerPanelElement = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      panelElementsRef.current.set(id, element);
      return;
    }
    panelElementsRef.current.delete(id);
  }, []);

  const openLookup = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const queryKey = normalizeLookupQueryKey(trimmed);

      const existing = panels.find(
        (panel) => normalizeLookupQueryKey(panel.query) === queryKey,
      );
      if (existing) {
        onPanelsChange((prev) =>
          prev.map((panel) => ({
            ...panel,
            collapsed: panel.id !== existing.id,
          })),
        );
        queueMicrotask(() => requestPanelScroll(existing.id, existing.collapsed));
        return;
      }

      const id = createPanelId();
      const nextPanel: LookupPanelRecord = {
        id,
        query: trimmed,
        collapsed: false,
        status: "loading",
      };

      onPanelsChange((prev) => [
        ...prev.map((panel) => ({ ...panel, collapsed: true })),
        nextPanel,
      ]);
      queueMicrotask(() => requestPanelScroll(id, true));
    },
    [onPanelsChange, panels, requestPanelScroll],
  );

  const toggleCollapsed = useCallback(
    (id: string) => {
      const panel = panels.find((entry) => entry.id === id);
      const expanding = panel?.collapsed ?? false;
      onPanelsChange((prev) =>
        prev.map((panel) => {
          if (panel.id !== id) return panel;
          return { ...panel, collapsed: !panel.collapsed };
        }),
      );
      if (expanding) {
        queueMicrotask(() => requestPanelScroll(id, true));
      }
    },
    [onPanelsChange, panels, requestPanelScroll],
  );

  const clearPanels = useCallback(() => {
    clearScrollRetries();
    pendingScrollRef.current = null;
    onPanelsChange([]);
    panelElementsRef.current.clear();
  }, [clearScrollRetries, onPanelsChange]);

  const value = useMemo(
    () => ({
      panels,
      openLookup,
      toggleCollapsed,
      clearPanels,
      registerPanelElement,
      scrollPanelIntoView,
      notifyPanelBodyExpanded,
    }),
    [
      clearPanels,
      notifyPanelBodyExpanded,
      openLookup,
      panels,
      registerPanelElement,
      scrollPanelIntoView,
      toggleCollapsed,
    ],
  );

  return (
    <LookupPanelsContext.Provider value={value}>{children}</LookupPanelsContext.Provider>
  );
}

export function useLookupPanels(): LookupPanelsContextValue {
  const context = useContext(LookupPanelsContext);
  if (!context) {
    throw new Error("useLookupPanels must be used within LookupPanelsProvider");
  }
  return context;
}
