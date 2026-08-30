import {
  decodeJsQrFromRgba,
  type JsQrLocation,
} from "./decode-jsqr";

export type WorkerDecodeRequest = {
  id: number;
  width: number;
  height: number;
  inversionAttempts: "dontInvert" | "attemptBoth";
};

export type WorkerDecodePayload = WorkerDecodeRequest & {
  /** RGBA buffer; transferred from the main thread. */
  buffer: ArrayBuffer;
};

export type WorkerQrLocation = JsQrLocation;

export type WorkerDecodeResponse = {
  id: number;
  data: string | null;
  location: WorkerQrLocation | null;
};

self.onmessage = (event: MessageEvent<WorkerDecodePayload>) => {
  const { id, buffer, width, height, inversionAttempts } = event.data;
  const pixels = new Uint8ClampedArray(buffer);
  const result = decodeJsQrFromRgba(pixels, width, height, inversionAttempts);
  const response: WorkerDecodeResponse = {
    id,
    data: result?.data ?? null,
    location: result?.location ?? null,
  };
  self.postMessage(response);
};
