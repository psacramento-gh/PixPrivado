"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { normalizeLookupQueryKey } from "@/lib/lookup/normalize-query-key";
import type { LookupPanelRecord } from "@/lib/lookup/panel-types";

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
  const pendingScrollPanelIdRef = useRef<string | null>(null);

  const scrollPanelIntoView = useCallback((id: string) => {
    const element = panelElementsRef.current.get(id);
    if (!element) {
      pendingScrollPanelIdRef.current = id;
      return;
    }

    pendingScrollPanelIdRef.current = null;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    const heading = element.querySelector<HTMLElement>("[data-lookup-panel-heading]");
    heading?.focus({ preventScroll: true });
  }, []);

  const registerPanelElement = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        panelElementsRef.current.set(id, element);
        if (pendingScrollPanelIdRef.current === id) {
          requestAnimationFrame(() => scrollPanelIntoView(id));
        }
        return;
      }
      panelElementsRef.current.delete(id);
    },
    [scrollPanelIntoView],
  );

  const openLookup = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const queryKey = normalizeLookupQueryKey(trimmed);

      onPanelsChange((prev) => {
        const existing = prev.find(
          (panel) => normalizeLookupQueryKey(panel.query) === queryKey,
        );
        if (existing) {
          pendingScrollPanelIdRef.current = existing.id;
          requestAnimationFrame(() => scrollPanelIntoView(existing.id));
          return prev.map((panel) => ({
            ...panel,
            collapsed: panel.id !== existing.id,
          }));
        }

        const id = createPanelId();
        const nextPanel: LookupPanelRecord = {
          id,
          query: trimmed,
          page: 1,
          collapsed: false,
          status: "loading",
        };

        pendingScrollPanelIdRef.current = id;
        return [
          ...prev.map((panel) => ({ ...panel, collapsed: true })),
          nextPanel,
        ];
      });
    },
    [onPanelsChange, scrollPanelIntoView],
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
        pendingScrollPanelIdRef.current = id;
        requestAnimationFrame(() => scrollPanelIntoView(id));
      }
    },
    [onPanelsChange, scrollPanelIntoView],
  );

  const setPanelPage = useCallback(
    (id: string, page: number) => {
      pendingScrollPanelIdRef.current = id;
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
      requestAnimationFrame(() => scrollPanelIntoView(id));
    },
    [onPanelsChange, scrollPanelIntoView],
  );

  const clearPanels = useCallback(() => {
    onPanelsChange([]);
    panelElementsRef.current.clear();
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
