import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { collectOfflinePrecacheUrls } from "./offline-precache-urls.mjs";

const STATIC_DIR = path.join(process.cwd(), ".next", "static");
const MANIFEST_NAME = "offline-precache.json";

async function walkFiles(dir, relative = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(abs, rel)));
      continue;
    }
    if (!entry.isFile()) continue;

    const record = { path: rel };
    if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
      record.text = await readFile(abs, "utf8");
    }
    files.push(record);
  }

  return files;
}

const files = await walkFiles(STATIC_DIR);
const urls = collectOfflinePrecacheUrls(files);
const dest = path.join(STATIC_DIR, MANIFEST_NAME);
await writeFile(dest, `${JSON.stringify(urls, null, 2)}\n`);
console.log(`Wrote ${urls.length} offline precache URLs to ${dest}`);
