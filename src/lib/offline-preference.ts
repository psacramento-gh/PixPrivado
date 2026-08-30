/** Shared key for offline-mode localStorage preference. */
export const OFFLINE_MODE_STORAGE_KEY = "pix-decoder:offline-mode";

type Listener = () => void;

const preferenceListeners = new Set<Listener>();

export function parseOfflinePreference(
  value: string | null | undefined,
): boolean {
  return value === "1" || value === "true";
}

export function readOfflinePreference(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return parseOfflinePreference(
      localStorage.getItem(OFFLINE_MODE_STORAGE_KEY),
    );
  } catch {
    return false;
  }
}

function emitOfflinePreferenceChange(): void {
  for (const listener of preferenceListeners) listener();
}

function onStorage(event: StorageEvent): void {
  if (event.key === OFFLINE_MODE_STORAGE_KEY || event.key === null) {
    emitOfflinePreferenceChange();
  }
}

export function subscribeOfflinePreference(listener: Listener): () => void {
  const isFirst = preferenceListeners.size === 0;
  preferenceListeners.add(listener);
  if (isFirst && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    preferenceListeners.delete(listener);
    if (preferenceListeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function writeOfflinePreference(offline: boolean): void {
  if (typeof window === "undefined") return;

  try {
    if (offline) {
      localStorage.setItem(OFFLINE_MODE_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(OFFLINE_MODE_STORAGE_KEY);
    }
  } catch {
    // Ignore private mode / quota errors.
  }

  emitOfflinePreferenceChange();
}

export function subscribeBrowserOnline(listener: Listener): () => void {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

export function readBrowserOnline(): boolean {
  return navigator.onLine;
}

export function readBrowserOnlineServer(): boolean {
  return true;
}

export function readOfflinePreferenceServer(): boolean {
  return false;
}
