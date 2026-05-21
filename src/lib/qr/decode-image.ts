import jsQR from "jsqr";

export async function decodeQrFromFile(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    return decodeQrFromImageSource(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

export async function decodeQrFromClipboardItem(
  item: ClipboardItem,
): Promise<string | null> {
  const imageType = item.types.find((t) => t.startsWith("image/"));
  if (!imageType) return null;
  const blob = await item.getType(imageType);
  const bitmap = await createImageBitmap(blob);
  try {
    return decodeQrFromImageSource(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

function decodeQrFromImageSource(
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
): string | null {
  const canvas = document.createElement("canvas");
  const maxDim = 1024;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.max(1, Math.floor(width * scale));
  const h = Math.max(1, Math.floor(height * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const result = jsQR(imageData.data, w, h, {
    inversionAttempts: "attemptBoth",
  });
  return result?.data ?? null;
}
