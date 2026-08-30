import assert from "node:assert/strict";
import test from "node:test";
import { collectOfflinePrecacheUrls } from "./offline-precache-urls.mjs";

test("collectOfflinePrecacheUrls includes named worker files", () => {
  const urls = collectOfflinePrecacheUrls([
    { path: "media/decode-worker.abc.ts" },
    { path: "chunks/turbopack-worker-xyz.js" },
    { path: "chunks/unrelated.js" },
  ]);

  assert.deepEqual(urls, [
    "/_next/static/chunks/turbopack-worker-xyz.js",
    "/_next/static/media/decode-worker.abc.ts",
  ]);
});

test("collectOfflinePrecacheUrls follows worker graph references in JS", () => {
  const urls = collectOfflinePrecacheUrls([
    {
      path: "chunks/loader.js",
      text: `e.b(t,"static/chunks/turbopack-worker-0sjn.js",["static/chunks/jsqr-chunk.js","static/chunks/runtime.js"],n); e.q("/_next/static/media/decode-worker.0y.ts")`,
    },
  ]);

  assert.ok(urls.includes("/_next/static/chunks/turbopack-worker-0sjn.js"));
  assert.ok(urls.includes("/_next/static/chunks/jsqr-chunk.js"));
  assert.ok(urls.includes("/_next/static/chunks/runtime.js"));
  assert.ok(urls.includes("/_next/static/media/decode-worker.0y.ts"));
});
