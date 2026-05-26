import jsQR from "jsqr";

/** Upper bounds tried for full-image decode (highest first). */
const FULL_DECODE_MAX_DIMS = [2560, 2048, 1536, 1024] as const;

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

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
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
  return out.sort((a, b) => b - a);
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
): Promise<QrDecodeResult | null> {
  const img = await loadImageFromFile(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  for (const maxDim of fullDecodeMaxDims(w, h)) {
    const result = decodeQrFromImageSource(img, w, h, maxDim);
    if (result) return result;
  }
  return null;
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
