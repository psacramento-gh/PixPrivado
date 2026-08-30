const CACHE_VERSION = "pix-privado-offline-v1";
const PRECACHE_URLS = ["/", "/about", "/manifest.webmanifest"];

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch {
            // Runtime caching fills this in after the first online visit.
          }
        }),
      );
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
