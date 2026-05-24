import { isAllowedDehashedQuery } from "./build-query";
import { DEHASHED_API_URL } from "./constants";
import { buildDehashedWebSearchUrl } from "./web-url";

const DEFAULT_SIZE = 50;
const SEARCH_TIMEOUT_MS = 15_000;

export type DehashedEntry = Record<string, unknown>;

export type DehashedSearchResult =
  | {
      ok: true;
      query: string;
      webUrl: string;
      total: number;
      entries: DehashedEntry[];
      balance?: number;
    }
  | {
      ok: false;
      query: string;
      webUrl: string;
      error: string;
      status?: number;
    };

function parseEntries(data: unknown): DehashedEntry[] {
  if (!data || typeof data !== "object") return [];
  const entries = (data as { entries?: unknown }).entries;
  if (!Array.isArray(entries)) return [];
  return entries.filter((e): e is DehashedEntry => e !== null && typeof e === "object");
}

export async function searchDehashed(
  query: string,
  size = DEFAULT_SIZE,
): Promise<DehashedSearchResult> {
  const trimmed = query.trim();
  const webUrl = buildDehashedWebSearchUrl(trimmed);

  if (!trimmed || !isAllowedDehashedQuery(trimmed)) {
    return { ok: false, query: trimmed, webUrl, error: "Invalid or disallowed query" };
  }

  const apiKey = process.env.DEHASHED_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      query: trimmed,
      webUrl,
      error:
        "DEHASHED_API_KEY is not available in this deployment. On Vercel, add it for Preview (branch deploys) and Production, then redeploy.",
      status: 503,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(DEHASHED_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "DeHashed-Api-Key": apiKey,
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: trimmed,
        page: 1,
        size: Math.min(Math.max(size, 1), 100),
        wildcard: false,
        regex: false,
        de_dupe: true,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : `Dehashed API returned ${response.status}`;
      return {
        ok: false,
        query: trimmed,
        webUrl,
        error: message,
        status: response.status,
      };
    }

    const total =
      data && typeof data === "object" && typeof (data as { total?: unknown }).total === "number"
        ? (data as { total: number }).total
        : 0;
    const balance =
      data && typeof data === "object" && typeof (data as { balance?: unknown }).balance === "number"
        ? (data as { balance: number }).balance
        : undefined;

    return {
      ok: true,
      query: trimmed,
      webUrl,
      total,
      entries: parseEntries(data),
      balance,
    };
  } catch {
    return {
      ok: false,
      query: trimmed,
      webUrl,
      error: "Could not reach the Dehashed API",
    };
  } finally {
    clearTimeout(timeout);
  }
}
