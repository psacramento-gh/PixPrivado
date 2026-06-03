import { loadOrientedBitmap } from "@/lib/qr/load-oriented-bitmap";
import type { WorkerDecodePayload, WorkerQrLocation } from "@/lib/qr/decode-worker";

const DESKTOP_DECODE_MAX_DIMS = [1024, 1536, 2048, 2560] as const;
const MOBILE_DECODE_MAX_DIMS = [768, 1024, 1280, 1536] as const;

/** Wall-clock budget for a single jsQR pass in the worker. */
const WORKER_PASS_TIMEOUT_MS = 7_000;

/** Wall-clock budget for createImageBitmap on slow devices. */
const BITMAP_LOAD_TIMEOUT_MS = 15_000;

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

type JsQrLocation = WorkerQrLocation;

type DetectedBarcode = {
  rawValue: string;
  boundingBox: DOMRectReadOnly;
  cornerPoints?: DOMPointReadOnly[];
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmap) => Promise<DetectedBarcode[]>;
};

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new QrDecodeAbortedError();
  }
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function isCoarsePointerDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function fullDecodeMaxDims(width: number, height: number): number[] {
  const presets = isCoarsePointerDevice()
    ? MOBILE_DECODE_MAX_DIMS
    : DESKTOP_DECODE_MAX_DIMS;
  const long = Math.max(width, height);
  const cap = isCoarsePointerDevice()
    ? Math.min(long, 1536)
    : Math.min(long, 2560);
  const caps = [cap, ...presets];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const dim of caps) {
    const scale = Math.min(1, dim / long);
    const key = Math.round(scale * 1000);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(dim);
  }
  return out.sort((a, b) => a - b);
}

function mapLocationToCorners(
  location: JsQrLocation,
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

function cornersFromBoundingBox(
  box: DOMRectReadOnly,
  naturalWidth: number,
  naturalHeight: number,
): { corners: QrCorners; normalizedCorners: NormalizedQrCorners } {
  const corners: QrCorners = {
    topLeft: { x: box.x, y: box.y },
    topRight: { x: box.x + box.width, y: box.y },
    bottomRight: { x: box.x + box.width, y: box.y + box.height },
    bottomLeft: { x: box.x, y: box.y + box.height },
  };
  const toNormalized = (p: QrPoint): QrPoint => ({
    x: p.x / naturalWidth,
    y: p.y / naturalHeight,
  });
  return {
    corners,
    normalizedCorners: {
      topLeft: toNormalized(corners.topLeft),
      topRight: toNormalized(corners.topRight),
      bottomRight: toNormalized(corners.bottomRight),
      bottomLeft: toNormalized(corners.bottomLeft),
    },
  };
}

function getBarcodeDetector(): BarcodeDetectorLike | null {
  if (typeof window === "undefined") return null;
  const BarcodeDetectorCtor = (
    globalThis as typeof globalThis & {
      BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
    }
  ).BarcodeDetector;
  if (!BarcodeDetectorCtor) return null;
  try {
    return new BarcodeDetectorCtor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

async function decodeWithBarcodeDetector(
  bitmap: ImageBitmap,
  naturalWidth: number,
  naturalHeight: number,
  signal?: AbortSignal,
): Promise<QrDecodeResult | null> {
  const detector = getBarcodeDetector();
  if (!detector) return null;
  throwIfAborted(signal);
  let barcodes: DetectedBarcode[];
  try {
    barcodes = await detector.detect(bitmap);
  } catch {
    return null;
  }
  throwIfAborted(signal);
  const match = barcodes.find((b) => b.rawValue?.trim());
  if (!match) return null;
  const { corners, normalizedCorners } = cornersFromBoundingBox(
    match.boundingBox,
    naturalWidth,
    naturalHeight,
  );
  return {
    data: match.rawValue,
    corners,
    normalizedCorners,
    naturalWidth,
    naturalHeight,
  };
}

async function loadBitmapWithTimeout(
  file: File,
  signal?: AbortSignal,
): Promise<ImageBitmap> {
  throwIfAborted(signal);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const bitmapPromise = loadOrientedBitmap(file);
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new QrDecodeAbortedError("Image load timed out")),
      BITMAP_LOAD_TIMEOUT_MS,
    );
  });
  const abortPromise = new Promise<never>((_, reject) => {
    signal?.addEventListener(
      "abort",
      () => reject(new QrDecodeAbortedError()),
      { once: true },
    );
  });
  try {
    return await Promise.race([bitmapPromise, timeoutPromise, abortPromise]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

let workerRequestId = 0;

async function jsQrInWorker(
  imageData: ImageData,
  inversionAttempts: "dontInvert" | "attemptBoth",
  signal?: AbortSignal,
): Promise<{ data: string; location: JsQrLocation } | null> {
  throwIfAborted(signal);
  const id = ++workerRequestId;
  const worker = new Worker(new URL("./decode-worker.ts", import.meta.url), {
    type: "module",
  });

  const buffer = imageData.data.buffer.slice(0);
  const payload: WorkerDecodePayload = {
    id,
    buffer,
    width: imageData.width,
    height: imageData.height,
    inversionAttempts,
  };

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timerId);
      worker.terminate();
      fn();
    };

    const timerId = setTimeout(() => {
      finish(() => resolve(null));
    }, WORKER_PASS_TIMEOUT_MS);

    const onAbort = () => {
      finish(() => reject(new QrDecodeAbortedError()));
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event) => {
      const { data, location } = event.data;
      finish(() => {
        signal?.removeEventListener("abort", onAbort);
        if (!data || !location) {
          resolve(null);
          return;
        }
        resolve({ data, location });
      });
    };

    worker.onerror = () => {
      finish(() => {
        signal?.removeEventListener("abort", onAbort);
        reject(new QrDecodeAbortedError("QR worker failed"));
      });
    };

    worker.postMessage(payload, [buffer]);
  });
}

function prepareImageData(
  source: ImageBitmap,
  width: number,
  height: number,
  maxDim: number,
): ImageData | null {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.max(1, Math.floor(width * scale));
  const h = Math.max(1, Math.floor(height * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

async function decodeQrFromImageSource(
  source: ImageBitmap,
  width: number,
  height: number,
  maxDim: number,
  inversionAttempts: "dontInvert" | "attemptBoth",
  signal?: AbortSignal,
): Promise<QrDecodeResult | null> {
  const imageData = prepareImageData(source, width, height, maxDim);
  if (!imageData) return null;
  const scale = imageData.width / width;
  const found = await jsQrInWorker(imageData, inversionAttempts, signal);
  if (!found) return null;

  const { corners, normalizedCorners } = mapLocationToCorners(
    found.location,
    scale,
    width,
    height,
  );

  return {
    data: found.data,
    corners,
    normalizedCorners,
    naturalWidth: width,
    naturalHeight: height,
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
  const bitmap = await loadBitmapWithTimeout(file, signal);
  try {
    const w = bitmap.width;
    const h = bitmap.height;

    const native = await decodeWithBarcodeDetector(bitmap, w, h, signal);
    if (native) return native;

    const dims = fullDecodeMaxDims(w, h);
    for (const maxDim of dims) {
      throwIfAborted(signal);
      const fast = await decodeQrFromImageSource(
        bitmap,
        w,
        h,
        maxDim,
        "dontInvert",
        signal,
      );
      if (fast) return fast;
      await yieldToMain();
    }

    const largest = dims[dims.length - 1] ?? 1024;
    throwIfAborted(signal);
    return decodeQrFromImageSource(
      bitmap,
      w,
      h,
      largest,
      "attemptBoth",
      signal,
    );
  } finally {
    bitmap.close();
  }
}
