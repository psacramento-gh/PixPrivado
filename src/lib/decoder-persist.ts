import type { Locale } from "@/lib/brcode/labels";
import type { NormalizedQrCorners } from "@/lib/qr/decode-image";

const STORAGE_KEY = "pix-decoder:last-decode";
/** @deprecated Migrated into localStorage bundle; cleared on read. */
const LEGACY_IMAGE_SESSION_KEY = "pix-decoder:last-image";

export type RestoredImageSession = {
  file: File;
  url: string;
  normalizedCorners: NormalizedQrCorners;
};

type PersistedImagePayload = {
  dataUrl: string;
  name: string;
  type: string;
  normalizedCorners: NormalizedQrCorners;
};

type PersistedDecoderState = {
  rawPayload: string;
  copiaCola: string;
  imageSubmitted: boolean;
  locale: Locale;
  image?: PersistedImagePayload;
};

export type PersistedDecoderBundle = {
  rawPayload: string;
  copiaCola: string;
  imageSubmitted: boolean;
  locale: Locale;
};

export type RestoredDecoderBundle = PersistedDecoderBundle & {
  imageSession: RestoredImageSession | null;
};

export async function loadPersistedDecoderBundle(): Promise<RestoredDecoderBundle | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedDecoderState>;
    if (typeof parsed.rawPayload !== "string" || !parsed.rawPayload.trim()) {
      return null;
    }

    const bundle: PersistedDecoderBundle = {
      rawPayload: parsed.rawPayload,
      copiaCola:
        typeof parsed.copiaCola === "string" ? parsed.copiaCola : parsed.rawPayload,
      imageSubmitted: Boolean(parsed.imageSubmitted),
      locale: parsed.locale === "pt" ? "pt" : "en",
    };

    let imagePayload = parsed.image;
    if (!imagePayload) {
      imagePayload = readLegacyImagePayload();
    }

    const imageSession =
      bundle.imageSubmitted && imagePayload
        ? await imagePayloadToSession(imagePayload)
        : null;

    return { ...bundle, imageSession };
  } catch {
    return null;
  }
}

export async function savePersistedDecoderBundle(
  bundle: PersistedDecoderBundle,
  imageSession: RestoredImageSession | null,
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedDecoderState = { ...bundle };

    if (bundle.imageSubmitted && imageSession) {
      payload.image = {
        dataUrl: await readFileAsDataUrl(imageSession.file),
        name: imageSession.file.name,
        type: imageSession.file.type || "image/png",
        normalizedCorners: imageSession.normalizedCorners,
      };
    } else if (bundle.imageSubmitted && !imageSession) {
      // Keep existing image data while session is hydrating or unavailable.
      const existing = readStoredPayload();
      if (existing?.image) {
        payload.image = existing.image;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    sessionStorage.removeItem(LEGACY_IMAGE_SESSION_KEY);
  } catch {
    // Ignore quota / private mode errors.
  }
}

function readStoredPayload(): PersistedDecoderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedDecoderState;
  } catch {
    return null;
  }
}

export function clearPersistedDecoderState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_IMAGE_SESSION_KEY);
  } catch {
    // Ignore.
  }
}

function readLegacyImagePayload(): PersistedImagePayload | undefined {
  try {
    const fromSession = sessionStorage.getItem(LEGACY_IMAGE_SESSION_KEY);
    const raw = fromSession ?? undefined;
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as Partial<PersistedImagePayload>;
    if (typeof parsed.dataUrl !== "string") return undefined;
    if (!parsed.normalizedCorners || !isNormalizedQrCorners(parsed.normalizedCorners)) {
      return undefined;
    }

    sessionStorage.removeItem(LEGACY_IMAGE_SESSION_KEY);
    return {
      dataUrl: parsed.dataUrl,
      name: parsed.name ?? "qr-image.png",
      type: parsed.type ?? "image/png",
      normalizedCorners: parsed.normalizedCorners,
    };
  } catch {
    return undefined;
  }
}

async function imagePayloadToSession(
  payload: PersistedImagePayload,
): Promise<RestoredImageSession | null> {
  if (!isNormalizedQrCorners(payload.normalizedCorners)) return null;
  try {
    const response = await fetch(payload.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], payload.name ?? "qr-image.png", {
      type: payload.type ?? blob.type,
    });
    return {
      file,
      url: URL.createObjectURL(file),
      normalizedCorners: payload.normalizedCorners,
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
