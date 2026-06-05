"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { normalizeLookupQueryKey } from "@/lib/lookup/normalize-query-key";
import type { LookupPanelRecord } from "@/lib/lookup/panel-types";
import { APP_MOTION_DURATION } from "@/lib/motion-presets";

type PendingPanelScroll = {
  id: string;
  waitForExpand: boolean;
};

type LookupPanelsContextValue = {
  panels: LookupPanelRecord[];
  openLookup: (query: string) => void;
  toggleCollapsed: (id: string) => void;
  setPanelPage: (id: string, page: number) => void;
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
  const scrollFallbackTimerRef = useRef<number | null>(null);
  const [scrollRequest, setScrollRequest] = useState(0);

  const clearScrollFallback = useCallback(() => {
    if (scrollFallbackTimerRef.current !== null) {
      window.clearTimeout(scrollFallbackTimerRef.current);
      scrollFallbackTimerRef.current = null;
    }
  }, []);

  const scrollPanelIntoView = useCallback(
    (id: string, options?: { behavior?: ScrollBehavior }) => {
      const element = panelElementsRef.current.get(id);
      if (!element) return false;

      element.scrollIntoView({
        behavior: options?.behavior ?? "smooth",
        block: "start",
      });
      const heading = element.querySelector<HTMLElement>("[data-lookup-panel-heading]");
      heading?.focus({ preventScroll: true });
      return true;
    },
    [],
  );

  const commitPanelScroll = useCallback(
    (id: string) => {
      if (pendingScrollRef.current?.id !== id) return;

      const panel = panels.find((entry) => entry.id === id);
      if (!panel || panel.collapsed) return;
      if (!scrollPanelIntoView(id, { behavior: "auto" })) return;

      clearScrollFallback();
      pendingScrollRef.current = null;
    },
    [clearScrollFallback, panels, scrollPanelIntoView],
  );

  const requestPanelScroll = useCallback(
    (id: string, waitForExpand: boolean) => {
      clearScrollFallback();
      pendingScrollRef.current = { id, waitForExpand };

      if (waitForExpand) {
        scrollFallbackTimerRef.current = window.setTimeout(() => {
          commitPanelScroll(id);
        }, APP_MOTION_DURATION * 1000 + 50);
        return;
      }

      setScrollRequest((request) => request + 1);
    },
    [clearScrollFallback, commitPanelScroll],
  );

  const notifyPanelBodyExpanded = useCallback(
    (id: string) => {
      if (pendingScrollRef.current?.id !== id || !pendingScrollRef.current.waitForExpand) {
        return;
      }
      commitPanelScroll(id);
    },
    [commitPanelScroll],
  );

  useLayoutEffect(() => {
    const pending = pendingScrollRef.current;
    if (!pending || pending.waitForExpand) return;

    const panel = panels.find((entry) => entry.id === pending.id);
    if (!panel || panel.collapsed) return;
    if (!panelElementsRef.current.has(pending.id)) return;

    commitPanelScroll(pending.id);
  }, [commitPanelScroll, panels, scrollRequest]);

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
      const scrollIntentRef: { current: PendingPanelScroll | null } = { current: null };

      onPanelsChange((prev) => {
        const existing = prev.find(
          (panel) => normalizeLookupQueryKey(panel.query) === queryKey,
        );
        if (existing) {
          scrollIntentRef.current = {
            id: existing.id,
            waitForExpand: existing.collapsed,
          };
          return prev.map((panel) => ({
            ...panel,
            collapsed: panel.id !== existing.id,
          }));
        }

        const id = createPanelId();
        scrollIntentRef.current = { id, waitForExpand: true };
        const nextPanel: LookupPanelRecord = {
          id,
          query: trimmed,
          page: 1,
          collapsed: false,
          status: "loading",
        };

        return [
          ...prev.map((panel) => ({ ...panel, collapsed: true })),
          nextPanel,
        ];
      });

      const scrollIntent = scrollIntentRef.current;
      if (scrollIntent) {
        requestPanelScroll(scrollIntent.id, scrollIntent.waitForExpand);
      }
    },
    [onPanelsChange, requestPanelScroll],
  );

  const toggleCollapsed = useCallback(
    (id: string) => {
      let expanding = false;
      onPanelsChange((prev) =>
        prev.map((panel) => {
          if (panel.id !== id) return panel;
          expanding = panel.collapsed;
          return { ...panel, collapsed: !panel.collapsed };
        }),
      );
      if (expanding) {
        requestPanelScroll(id, true);
      }
    },
    [onPanelsChange, requestPanelScroll],
  );

  const setPanelPage = useCallback(
    (id: string, page: number) => {
      requestPanelScroll(id, false);
      onPanelsChange((prev) =>
        prev.map((panel) =>
          panel.id === id
            ? {
                ...panel,
                page,
                status: "loading",
                result: undefined,
                errorMessage: undefined,
              }
            : panel,
        ),
      );
    },
    [onPanelsChange, requestPanelScroll],
  );

  const clearPanels = useCallback(() => {
    clearScrollFallback();
    pendingScrollRef.current = null;
    onPanelsChange([]);
    panelElementsRef.current.clear();
  }, [clearScrollFallback, onPanelsChange]);

  const value = useMemo(
    () => ({
      panels,
      openLookup,
      toggleCollapsed,
      setPanelPage,
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
      setPanelPage,
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
