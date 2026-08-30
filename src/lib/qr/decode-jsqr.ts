import jsQR from "jsqr";

export type JsQrLocation = {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
};

export type JsQrDecodeResult = {
  data: string;
  location: JsQrLocation;
};

/** Same jsQR pass used by the worker and the main-thread offline fallback. */
export function decodeJsQrFromRgba(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  inversionAttempts: "dontInvert" | "attemptBoth",
): JsQrDecodeResult | null {
  const result = jsQR(pixels, width, height, { inversionAttempts });
  if (!result?.data || !result.location) return null;
  return {
    data: result.data,
    location: result.location,
  };
}

/** Skip the extra worker fetch when the browser is already offline. */
export function shouldUseQrWorker(): boolean {
  if (typeof Worker === "undefined") return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return false;
  }
  return true;
}
