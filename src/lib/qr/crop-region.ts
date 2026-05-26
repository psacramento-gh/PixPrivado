import type { QrCorners, QrPoint } from "@/lib/qr/decode-image";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const QR_CORNER_KEYS = [
  "topLeft",
  "topRight",
  "bottomRight",
  "bottomLeft",
] as const satisfies readonly (keyof QrCorners)[];

/** Axis-aligned crop around the QR quad, with padding, clamped to the image. */
export function computeQrCropRect(
  corners: QrCorners,
  imageWidth: number,
  imageHeight: number,
  paddingRatio = 0.14,
): CropRect {
  const points: QrPoint[] = QR_CORNER_KEYS.map((key) => corners[key]);

  let minX = Math.min(...points.map((p) => p.x));
  let maxX = Math.max(...points.map((p) => p.x));
  let minY = Math.min(...points.map((p) => p.y));
  let maxY = Math.max(...points.map((p) => p.y));

  const qrWidth = Math.max(1, maxX - minX);
  const qrHeight = Math.max(1, maxY - minY);
  const padX = qrWidth * paddingRatio;
  const padY = qrHeight * paddingRatio;

  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(imageWidth, maxX + padX);
  maxY = Math.min(imageHeight, maxY + padY);

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return { x: minX, y: minY, width, height };
}

export function mapPointIntoCrop(
  point: QrPoint,
  crop: CropRect,
  displayWidth: number,
  displayHeight: number,
): QrPoint {
  return {
    x: ((point.x - crop.x) / crop.width) * displayWidth,
    y: ((point.y - crop.y) / crop.height) * displayHeight,
  };
}
