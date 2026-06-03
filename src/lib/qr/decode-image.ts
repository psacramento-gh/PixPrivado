import jsQR from "jsqr";
import { loadOrientedBitmap } from "@/lib/qr/load-oriented-bitmap";

/** Upper bounds tried for full-image decode (lowest first for faster “not found”). */
const FULL_DECODE_MAX_DIMS = [1024, 1536, 2048, 2560] as const;

export type QrPoint = { x: number; y: number };

export type QrCorners = {
  topLeft: QrPoint;
  topRight: QrPoint;
  bottomRight: QrPoint;
  bottomLeft: QrPoint;
};

/** Corner coordinates normalized to 0–1 relative to image natural size. */
export type NormalizedQrCorners = QrCorners;

export type QrDecodeResult = {
  data: string;
  corners: QrCorners;
  normalizedCorners: NormalizedQrCorners;
  naturalWidth: number;
  naturalHeight: number;
};

export type DecodeQrOptions = {
  signal?: AbortSignal;
};

export class QrDecodeAbortedError extends Error {
  constructor(message = "QR decode aborted") {
    super(message);
    this.name = "QrDecodeAbortedError";
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new QrDecodeAbortedError();
  }
}

/** Yields so long decode passes do not freeze the loading UI. */
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function fullDecodeMaxDims(width: number, height: number): number[] {
  const long = Math.max(width, height);
  const caps = [Math.min(long, 2560), ...FULL_DECODE_MAX_DIMS];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const cap of caps) {
    const scale = Math.min(1, cap / long);
    const key = Math.round(scale * 1000);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cap);
  }
  return out.sort((a, b) => a - b);
}

function mapLocationToCorners(
  location: NonNullable<ReturnType<typeof jsQR>>["location"],
  scale: number,
  naturalWidth: number,
  naturalHeight: number,
): { corners: QrCorners; normalizedCorners: NormalizedQrCorners } {
  const toNatural = (p: QrPoint): QrPoint => ({
    x: p.x / scale,
    y: p.y / scale,
  });
  const toNormalized = (p: QrPoint): QrPoint => ({
    x: p.x / naturalWidth,
    y: p.y / naturalHeight,
  });

  const topLeft = toNatural(location.topLeftCorner);
  const topRight = toNatural(location.topRightCorner);
  const bottomRight = toNatural(location.bottomRightCorner);
  const bottomLeft = toNatural(location.bottomLeftCorner);

  const corners = { topLeft, topRight, bottomRight, bottomLeft };
  return {
    corners,
    normalizedCorners: {
      topLeft: toNormalized(topLeft),
      topRight: toNormalized(topRight),
      bottomRight: toNormalized(bottomRight),
      bottomLeft: toNormalized(bottomLeft),
    },
  };
}

export function denormalizeQrCorners(
  normalized: NormalizedQrCorners,
  naturalWidth: number,
  naturalHeight: number,
): QrCorners {
  const denorm = (p: QrPoint): QrPoint => ({
    x: p.x * naturalWidth,
    y: p.y * naturalHeight,
  });
  return {
    topLeft: denorm(normalized.topLeft),
    topRight: denorm(normalized.topRight),
    bottomRight: denorm(normalized.bottomRight),
    bottomLeft: denorm(normalized.bottomLeft),
  };
}

export async function decodeQrFromFile(
  file: File,
  options?: DecodeQrOptions,
): Promise<QrDecodeResult | null> {
  const signal = options?.signal;
  throwIfAborted(signal);
  const bitmap = await loadOrientedBitmap(file);
  throwIfAborted(signal);
  try {
    const w = bitmap.width;
    const h = bitmap.height;
    for (const maxDim of fullDecodeMaxDims(w, h)) {
      throwIfAborted(signal);
      const result = decodeQrFromImageSource(bitmap, w, h, maxDim);
      if (result) return result;
      await yieldToMain();
    }
    return null;
  } finally {
    bitmap.close();
  }
}

function decodeQrFromImageSource(
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
  maxDim = 1024,
): QrDecodeResult | null {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.max(1, Math.floor(width * scale));
  const h = Math.max(1, Math.floor(height * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const result = jsQR(imageData.data, w, h, {
    inversionAttempts: "attemptBoth",
  });
  if (!result?.data) return null;

  const { corners, normalizedCorners } = mapLocationToCorners(
    result.location,
    scale,
    width,
    height,
  );

  return {
    data: result.data,
    corners,
    normalizedCorners,
    naturalWidth: width,
    naturalHeight: height,
  };
}
