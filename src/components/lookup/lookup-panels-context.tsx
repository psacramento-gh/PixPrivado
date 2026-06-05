"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  afterExpand: boolean;
};

type LookupPanelsContextValue = {
  panels: LookupPanelRecord[];
  openLookup: (query: string) => void;
  toggleCollapsed: (id: string) => void;
  setPanelPage: (id: string, page: number) => void;
  clearPanels: () => void;
  registerPanelElement: (id: string, element: HTMLElement | null) => void;
  scrollPanelIntoView: (id: string) => void;
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
  const [scrollTick, setScrollTick] = useState(0);

  const scrollPanelIntoView = useCallback(
    (id: string, options?: { behavior?: ScrollBehavior }) => {
      const element = panelElementsRef.current.get(id);
      if (!element) return false;

      pendingScrollRef.current = null;
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

  const queuePanelScroll = useCallback((id: string, afterExpand: boolean) => {
    pendingScrollRef.current = { id, afterExpand };
    setScrollTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    const pending = pendingScrollRef.current;
    if (!pending) return;

    const panel = panels.find((entry) => entry.id === pending.id);
    if (!panel || panel.collapsed) return;
    if (!panelElementsRef.current.has(pending.id)) return;

    const { id, afterExpand } = pending;
    const delay = afterExpand ? APP_MOTION_DURATION * 1000 + 16 : 0;

    const timer = window.setTimeout(() => {
      if (pendingScrollRef.current?.id !== id) return;
      scrollPanelIntoView(id, { behavior: "auto" });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [panels, scrollPanelIntoView, scrollTick]);

  const registerPanelElement = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        panelElementsRef.current.set(id, element);
        if (pendingScrollRef.current?.id === id) {
          setScrollTick((tick) => tick + 1);
        }
        return;
      }
      panelElementsRef.current.delete(id);
    },
    [],
  );

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
          scrollIntentRef.current = { id: existing.id, afterExpand: existing.collapsed };
          return prev.map((panel) => ({
            ...panel,
            collapsed: panel.id !== existing.id,
          }));
        }

        const id = createPanelId();
        scrollIntentRef.current = { id, afterExpand: true };
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
        queuePanelScroll(scrollIntent.id, scrollIntent.afterExpand);
      }
    },
    [onPanelsChange, queuePanelScroll],
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
        queuePanelScroll(id, true);
      }
    },
    [onPanelsChange, queuePanelScroll],
  );

  const setPanelPage = useCallback(
    (id: string, page: number) => {
      queuePanelScroll(id, false);
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
    [onPanelsChange, queuePanelScroll],
  );

  const clearPanels = useCallback(() => {
    onPanelsChange([]);
    panelElementsRef.current.clear();
    pendingScrollRef.current = null;
  }, [onPanelsChange]);

  const value = useMemo(
    () => ({
      panels,
      openLookup,
      toggleCollapsed,
      setPanelPage,
      clearPanels,
      registerPanelElement,
      scrollPanelIntoView,
    }),
    [
      clearPanels,
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
