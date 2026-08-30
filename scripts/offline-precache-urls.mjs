/**
 * Collect hashed Next.js assets needed to construct the QR decode worker
 * without waiting for the first `new Worker(...)` call.
 */

const WORKER_NAME_MARKERS = ["decode-worker", "turbopack-worker"];
const CHUNK_PATH_RE = /static\/chunks\/[A-Za-z0-9._~-]+/g;
const MEDIA_WORKER_RE = /\/_next\/static\/media\/decode-worker[^"'\s]+/g;

function toStaticUrl(relativePath) {
  return `/_next/static/${relativePath.replaceAll("\\", "/")}`;
}

/**
 * @param {{ path: string, text?: string }[]} files
 *        `path` is relative to `.next/static` (posix or windows).
 * @returns {string[]}
 */
export function collectOfflinePrecacheUrls(files) {
  const urls = new Set();

  for (const file of files) {
    const normalized = file.path.replaceAll("\\", "/");
    const base = normalized.split("/").pop() ?? "";
    if (WORKER_NAME_MARKERS.some((marker) => base.includes(marker))) {
      urls.add(toStaticUrl(normalized));
    }
  }

  for (const file of files) {
    const text = file.text;
    if (!text) continue;
    if (
      !text.includes("decode-worker") &&
      !text.includes("turbopack-worker")
    ) {
      continue;
    }

    for (const match of text.matchAll(MEDIA_WORKER_RE)) {
      urls.add(match[0]);
    }
    for (const match of text.matchAll(CHUNK_PATH_RE)) {
      urls.add(`/_next/${match[0]}`);
    }
  }

  return [...urls].sort();
}
