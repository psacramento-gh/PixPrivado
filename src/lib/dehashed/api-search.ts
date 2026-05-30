import { isAllowedDehashedQuery } from "./build-query";
import { DEHASHED_API_URL, DEHASHED_PAGE_SIZE } from "./constants";
import { DEHASHED_API_MAX_SIZE } from "./pagination";

const SEARCH_TIMEOUT_MS = 15_000;

export type DehashedEntry = Record<string, unknown>;

export type DehashedSearchResult =
  | {
      ok: true;
      query: string;
      total: number;
      page: number;
      pageSize: number;
      entries: DehashedEntry[];
      balance?: number;
    }
  | {
      ok: false;
      query: string;
      error: string;
      status?: number;
    };

function parseEntries(data: unknown): DehashedEntry[] {
  if (!data || typeof data !== "object") return [];
  const entries = (data as { entries?: unknown }).entries;
  if (!Array.isArray(entries)) return [];
  return entries.filter((e): e is DehashedEntry => e !== null && typeof e === "object");
}

type DehashedApiPayload = {
  query: string;
  page: number;
  size: number;
  de_dupe: boolean;
};

type DehashedApiResponse = {
  total: number;
  balance?: number;
  entries: DehashedEntry[];
};

async function requestDehashed(
  apiKey: string,
  payload: DehashedApiPayload,
): Promise<
  | { ok: true; data: DehashedApiResponse }
  | { ok: false; error: string; status?: number }
> {
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
        ...payload,
        wildcard: false,
        regex: false,
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
      return { ok: false, error: message, status: response.status };
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
      data: {
        total,
        balance,
        entries: parseEntries(data),
      },
    };
  } catch {
    return { ok: false, error: "Could not reach the Dehashed API" };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * For totals within one API request, fetch all deduplicated rows once and slice
 * pages in memory. Offset pagination with `de_dupe: true` can return short pages
 * and empty follow-up pages while `total` still reports remaining hits.
 */
async function searchDehashedBatched(
  apiKey: string,
  query: string,
  page: number,
  size: number,
  initial: DehashedApiResponse,
): Promise<DehashedSearchResult> {
  let allEntries = initial.entries;
  let balance = initial.balance;

  const needsFullBatch =
    page > 1 || (initial.total > 0 && allEntries.length < initial.total);

  if (needsFullBatch) {
    const batchSize = Math.min(DEHASHED_API_MAX_SIZE, initial.total);
    if (allEntries.length < batchSize) {
      const batch = await requestDehashed(apiKey, {
        query,
        page: 1,
        size: batchSize,
        de_dupe: true,
      });

      if (!batch.ok) {
        return { ok: false, query, error: batch.error, status: batch.status };
      }

      allEntries = batch.data.entries;
      balance = batch.data.balance ?? balance;
    }
  }

  const start = (page - 1) * size;
  const entries = allEntries.slice(start, start + size);

  return {
    ok: true,
    query,
    total: initial.total,
    page,
    pageSize: size,
    entries,
    balance,
  };
}

export async function searchDehashed(
  query: string,
  options: { page?: number; size?: number } = {},
): Promise<DehashedSearchResult> {
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const size = Math.min(Math.max(options.size ?? DEHASHED_PAGE_SIZE, 1), DEHASHED_API_MAX_SIZE);
  const trimmed = query.trim();

  if (!trimmed || !isAllowedDehashedQuery(trimmed)) {
    return { ok: false, query: trimmed, error: "Invalid or disallowed query" };
  }

  const apiKey = process.env.DEHASHED_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      query: trimmed,
      error:
        "DEHASHED_API_KEY is not available in this deployment. On Vercel, add it for Preview (branch deploys) and Production, then redeploy.",
      status: 503,
    };
  }

  const first = await requestDehashed(apiKey, {
    query: trimmed,
    page: 1,
    size,
    de_dupe: true,
  });

  if (!first.ok) {
    return { ok: false, query: trimmed, error: first.error, status: first.status };
  }

  const { total, balance, entries } = first.data;

  if (total > DEHASHED_API_MAX_SIZE) {
    if (page === 1) {
      return {
        ok: true,
        query: trimmed,
        total,
        page,
        pageSize: size,
        entries,
        balance,
      };
    }

    const remote = await requestDehashed(apiKey, {
      query: trimmed,
      page,
      size,
      de_dupe: false,
    });

    if (!remote.ok) {
      return { ok: false, query: trimmed, error: remote.error, status: remote.status };
    }

    return {
      ok: true,
      query: trimmed,
      total: remote.data.total,
      page,
      pageSize: size,
      entries: remote.data.entries,
      balance: remote.data.balance ?? balance,
    };
  }

  return searchDehashedBatched(apiKey, trimmed, page, size, first.data);
}
