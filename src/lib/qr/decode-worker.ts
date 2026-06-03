import jsQR from "jsqr";

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

export type WorkerQrLocation = {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
};

export type WorkerDecodeResponse = {
  id: number;
  data: string | null;
  location: WorkerQrLocation | null;
};

self.onmessage = (event: MessageEvent<WorkerDecodePayload>) => {
  const { id, buffer, width, height, inversionAttempts } = event.data;
  const pixels = new Uint8ClampedArray(buffer);
  const result = jsQR(pixels, width, height, { inversionAttempts });
  const response: WorkerDecodeResponse = {
    id,
    data: result?.data ?? null,
    location: result?.location ?? null,
  };
  self.postMessage(response);
};
