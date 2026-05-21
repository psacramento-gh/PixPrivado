import jsQR from "jsqr";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const MAX_DECODE_DIM = 1024;

export async function decodeQrFromFile(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    return decodeQrFromImageSource(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

export async function decodeQrFromCropRect(
  file: File,
  rect: CropRect,
): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    return decodeQrFromImageSource(bitmap, bitmap.width, bitmap.height, rect);
  } finally {
    bitmap.close();
  }
}

export async function loadImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

function decodeQrFromImageSource(
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
  crop?: CropRect,
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
  const scale = Math.min(1, MAX_DECODE_DIM / Math.max(sw, sh));
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
