import jsQR from "jsqr";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Upper bounds tried for full-image decode (highest first). */
const FULL_DECODE_MAX_DIMS = [2560, 2048, 1536, 1024] as const;
const CROP_DECODE_MAX_DIM = 2048;

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

export async function decodeQrFromFile(file: File): Promise<string | null> {
  const img = await loadImageFromFile(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  for (const maxDim of fullDecodeMaxDims(w, h)) {
    const data = decodeQrFromImageSource(img, w, h, undefined, maxDim);
    if (data) return data;
  }
  return null;
}

export async function decodeQrFromCropRect(
  file: File,
  rect: CropRect,
): Promise<string | null> {
  const img = await loadImageFromFile(file);
  return decodeQrFromImageSource(
    img,
    img.naturalWidth,
    img.naturalHeight,
    rect,
    CROP_DECODE_MAX_DIM,
  );
}

export async function loadImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const img = await loadImageFromFile(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

function decodeQrFromImageSource(
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
  crop?: CropRect,
  maxDim = 1024,
): string | null {
  const sx = crop ? Math.max(0, Math.floor(crop.x)) : 0;
  const sy = crop ? Math.max(0, Math.floor(crop.y)) : 0;
  const sw = crop
    ? Math.min(width - sx, Math.max(1, Math.floor(crop.width)))
    : width;
  const sh = crop
    ? Math.min(height - sy, Math.max(1, Math.floor(crop.height)))
    : height;

  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxDim / Math.max(sw, sh));
  const w = Math.max(1, Math.floor(sw * scale));
  const h = Math.max(1, Math.floor(sh * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const result = jsQR(imageData.data, w, h, {
    inversionAttempts: "attemptBoth",
  });
  return result?.data ?? null;
}
