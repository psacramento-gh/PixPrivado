import type { Locale } from "@/lib/brcode/labels";
import type { NormalizedQrCorners } from "@/lib/qr/decode-image";

const STORAGE_KEY = "pix-decoder:last-decode";
const IMAGE_STORAGE_KEY = "pix-decoder:last-image";

export type RestoredImageSession = {
  file: File;
  url: string;
  normalizedCorners: NormalizedQrCorners;
};

type PersistedImageSession = {
  dataUrl: string;
  name: string;
  type: string;
  normalizedCorners?: NormalizedQrCorners;
};

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
    sessionStorage.removeItem(IMAGE_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export async function savePersistedImageSession(session: {
  file: File;
  normalizedCorners: NormalizedQrCorners;
}): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const dataUrl = await readFileAsDataUrl(session.file);
    const payload: PersistedImageSession = {
      dataUrl,
      name: session.file.name,
      type: session.file.type || "image/png",
      normalizedCorners: session.normalizedCorners,
    };
    sessionStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / serialization errors.
  }
}

export async function loadPersistedImageSession(): Promise<RestoredImageSession | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(IMAGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedImageSession>;
    if (typeof parsed.dataUrl !== "string") {
      return null;
    }
    const response = await fetch(parsed.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], parsed.name ?? "qr-image.png", {
      type: parsed.type ?? blob.type,
    });
    if (!parsed.normalizedCorners || !isNormalizedQrCorners(parsed.normalizedCorners)) {
      return null;
    }
    const url = URL.createObjectURL(file);
    return {
      file,
      url,
      normalizedCorners: parsed.normalizedCorners,
    };
  } catch {
    return null;
  }
}

function isNormalizedQrCorners(value: unknown): value is NormalizedQrCorners {
  if (!value || typeof value !== "object") return false;
  const corners = ["topLeft", "topRight", "bottomRight", "bottomLeft"] as const;
  for (const key of corners) {
    const point = (value as NormalizedQrCorners)[key];
    if (
      !point ||
      typeof point !== "object" ||
      typeof point.x !== "number" ||
      typeof point.y !== "number" ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y)
    ) {
      return false;
    }
  }
  return true;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read image"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}
