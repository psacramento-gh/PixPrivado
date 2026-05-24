import type { Locale } from "@/lib/brcode/labels";

const STORAGE_KEY = "pix-decoder:last-decode";

export type PersistedDecoderState = {
  rawPayload: string;
  copiaCola: string;
  imageSubmitted: boolean;
  locale: Locale;
};

export function loadPersistedDecoderState(): PersistedDecoderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedDecoderState>;
    if (typeof parsed.rawPayload !== "string" || !parsed.rawPayload.trim()) {
      return null;
    }
    return {
      rawPayload: parsed.rawPayload,
      copiaCola: typeof parsed.copiaCola === "string" ? parsed.copiaCola : parsed.rawPayload,
      imageSubmitted: Boolean(parsed.imageSubmitted),
      locale: parsed.locale === "pt" ? "pt" : "en",
    };
  } catch {
    return null;
  }
}

export function savePersistedDecoderState(state: PersistedDecoderState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearPersistedDecoderState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
