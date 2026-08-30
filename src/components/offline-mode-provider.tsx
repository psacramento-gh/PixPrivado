"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  readBrowserOnline,
  readBrowserOnlineServer,
  readOfflinePreference,
  readOfflinePreferenceServer,
  subscribeBrowserOnline,
  subscribeOfflinePreference,
  writeOfflinePreference,
} from "@/lib/offline-preference";

export type OfflineModeContextValue = {
  /** Preference and connection have been read on the client. */
  ready: boolean;
  /** User chose offline mode (persisted). */
  preference: boolean;
  setPreference: (value: boolean) => void;
  togglePreference: () => void;
  /** Browser reports a network connection. */
  browserOnline: boolean;
  /** Show offline UI (after hydration). */
  offline: boolean;
  /** Skip lookups and other network features. */
  networkDisabled: boolean;
};

const OfflineModeContext = createContext<OfflineModeContextValue | null>(null);

export function OfflineModeProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const preference = useSyncExternalStore(
    subscribeOfflinePreference,
    readOfflinePreference,
    readOfflinePreferenceServer,
  );
  const browserOnline = useSyncExternalStore(
    subscribeBrowserOnline,
    readBrowserOnline,
    readBrowserOnlineServer,
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const setPreference = useCallback((value: boolean) => {
    writeOfflinePreference(value);
  }, []);

  const togglePreference = useCallback(() => {
    writeOfflinePreference(!readOfflinePreference());
  }, []);

  const value = useMemo<OfflineModeContextValue>(
    () => ({
      ready,
      preference,
      setPreference,
      togglePreference,
      browserOnline,
      offline: ready && (preference || !browserOnline),
      networkDisabled: !ready || preference || !browserOnline,
    }),
    [browserOnline, preference, ready, setPreference, togglePreference],
  );

  return (
    <OfflineModeContext.Provider value={value}>
      {children}
    </OfflineModeContext.Provider>
  );
}

export function useOfflineMode(): OfflineModeContextValue {
  const context = useContext(OfflineModeContext);
  if (!context) {
    throw new Error("useOfflineMode must be used within OfflineModeProvider");
  }
  return context;
}
