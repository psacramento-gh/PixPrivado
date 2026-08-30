const CACHE_VERSION = "pix-privado-offline-v2";
const PRECACHE_URLS = ["/", "/about", "/manifest.webmanifest"];
const PRECACHE_MANIFEST_URL = "/_next/static/offline-precache.json";

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

async function loadPrecacheUrls() {
  const urls = [...PRECACHE_URLS];

  try {
    const response = await fetch(PRECACHE_MANIFEST_URL, { cache: "reload" });
    if (response.ok) {
      const extra = await response.json();
      if (Array.isArray(extra)) {
        for (const url of extra) {
          if (typeof url === "string" && url.startsWith("/")) {
            urls.push(url);
          }
        }
      }
    }
  } catch {
    // Manifest is written after `next build`; runtime caching still applies.
  }

  return [...new Set(urls)];
}

async function precacheUrl(cache, url) {
  try {
    const response = await fetch(url, { cache: "reload" });
    if (response.ok) {
      await cache.put(url, response);
    }
  } catch {
    // Runtime caching fills this in after the first online visit.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      const urls = await loadPrecacheUrls();
      await Promise.all(urls.map((url) => precacheUrl(cache, url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiRequest(url)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;

        if (request.mode === "navigate") {
          const home = await cache.match("/");
          if (home) return home;
        }

        return Response.error();
      }
    })(),
  );
});
