import assert from "node:assert/strict";
import test from "node:test";
import QRCode from "qrcode";
import { decodeJsQrFromRgba, shouldUseQrWorker } from "./decode-jsqr.ts";

function rgbaFromQrMatrix(text: string, scale = 8): {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
} {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const modules = qr.modules;
  const size = modules.size;
  const width = size * scale;
  const pixels = new Uint8ClampedArray(width * width * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dark = modules.get(x, y);
      const value = dark ? 0 : 255;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const offset = ((y * scale + dy) * width + (x * scale + dx)) * 4;
          pixels[offset] = value;
          pixels[offset + 1] = value;
          pixels[offset + 2] = value;
          pixels[offset + 3] = 255;
        }
      }
    }
  }

  return { pixels, width, height: width };
}

test("decodeJsQrFromRgba reads a generated QR payload on the main thread", () => {
  const payload = "HELLO-PIX-OFFLINE";
  const { pixels, width, height } = rgbaFromQrMatrix(payload);
  const decoded = decodeJsQrFromRgba(pixels, width, height, "dontInvert");
  assert.ok(decoded);
  assert.equal(decoded!.data, payload);
  assert.ok(decoded!.location.topLeftCorner);
});

test("shouldUseQrWorker is false when the browser reports offline", () => {
  const previousWorker = globalThis.Worker;
  const previousNavigator = globalThis.navigator;
  Object.defineProperty(globalThis, "Worker", {
    configurable: true,
    value: function Worker() {},
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: false },
  });
  try {
    assert.equal(shouldUseQrWorker(), false);
  } finally {
    Object.defineProperty(globalThis, "Worker", {
      configurable: true,
      value: previousWorker,
    });
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: previousNavigator,
    });
  }
});
