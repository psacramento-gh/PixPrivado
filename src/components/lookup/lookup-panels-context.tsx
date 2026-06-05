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
import type { LookupPanelRecord } from "@/lib/lookup/panel-types";

type LookupPanelsContextValue = {
  panels: LookupPanelRecord[];
  openLookup: (query: string) => void;
  toggleCollapsed: (id: string) => void;
  setPanelPage: (id: string, page: number) => void;
  clearPanels: () => void;
  registerPanelElement: (id: string, element: HTMLElement | null) => void;
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

  const registerPanelElement = useCallback((id: string, element: HTMLElement | null) => {
    if (element) panelElementsRef.current.set(id, element);
    else panelElementsRef.current.delete(id);
  }, []);

  const focusPanel = useCallback((id: string) => {
    requestAnimationFrame(() => {
      const element = panelElementsRef.current.get(id);
      element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const heading = element?.querySelector<HTMLElement>("[data-lookup-panel-heading]");
      heading?.focus();
    });
  }, []);

  const openLookup = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const id = createPanelId();
      const nextPanel: LookupPanelRecord = {
        id,
        query: trimmed,
        page: 1,
        collapsed: false,
        status: "loading",
      };

      onPanelsChange((prev) => [
        ...prev.map((panel) => ({ ...panel, collapsed: true })),
        nextPanel,
      ]);
      focusPanel(id);
    },
    [focusPanel, onPanelsChange],
  );

  const toggleCollapsed = useCallback(
    (id: string) => {
      onPanelsChange((prev) =>
        prev.map((panel) =>
          panel.id === id ? { ...panel, collapsed: !panel.collapsed } : panel,
        ),
      );
    },
    [onPanelsChange],
  );

  const setPanelPage = useCallback(
    (id: string, page: number) => {
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
    [onPanelsChange],
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
    }),
    [clearPanels, openLookup, panels, registerPanelElement, setPanelPage, toggleCollapsed],
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
