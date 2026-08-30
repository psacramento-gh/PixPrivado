/** Same URL `decodeQrFromFile` passes to `new Worker`. */
export function getQrDecodeWorkerUrl(): URL {
  return new URL("./decode-worker.ts", import.meta.url);
}

/**
 * Request the QR worker graph so the service worker can cache it before the
 * first image decode. Safe to call more than once.
 */
export function prefetchQrDecodeWorker(): void {
  if (typeof window === "undefined") return;

  try {
    const worker = new Worker(getQrDecodeWorkerUrl(), { type: "module" });
    worker.terminate();
  } catch {
    // Decode will report a failure if the worker is unavailable.
  }
}
