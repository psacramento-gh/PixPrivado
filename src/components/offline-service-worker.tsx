"use client";

import { useEffect } from "react";
import { prefetchQrDecodeWorker } from "@/lib/qr/prefetch-decode-worker";

/** Registers the app-shell service worker in production so the decoder can load offline. */
export function OfflineServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void (async () => {
      await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      prefetchQrDecodeWorker();
    })();
  }, []);

  return null;
}
