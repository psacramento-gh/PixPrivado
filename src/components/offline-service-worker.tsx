"use client";

import { useEffect } from "react";

/** Registers the app-shell service worker in production so the decoder can load offline. */
export function OfflineServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
