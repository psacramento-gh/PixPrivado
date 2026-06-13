import { extractEmailFromQuery, isAllowedBreachQuery } from "./build-query";
import { HIBP_API_BASE_URL, HIBP_USER_AGENT } from "./constants";
import { sanitizeBreachDescription } from "./sanitize-description";

const SEARCH_TIMEOUT_MS = 15_000;

export type HibpBreach = {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
  IsStealerLog: boolean;
  IsSubscriptionFree: boolean;
};

export type BreachSearchResult =
  | {
      ok: true;
      query: string;
      email: string;
      breaches: HibpBreach[];
    }
  | {
      ok: false;
      query: string;
      error: string;
      status?: number;
    };

function parseBreaches(data: unknown): HibpBreach[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (breach): breach is HibpBreach =>
        breach !== null &&
        typeof breach === "object" &&
        typeof (breach as HibpBreach).Name === "string",
    )
    .map((breach) => ({
      ...breach,
      Description:
        typeof breach.Description === "string"
          ? sanitizeBreachDescription(breach.Description)
          : "",
    }));
}

export async function searchBreaches(query: string): Promise<BreachSearchResult> {
  const trimmed = query.trim();

  if (!trimmed || !isAllowedBreachQuery(trimmed)) {
    return { ok: false, query: trimmed, error: "Invalid or disallowed query" };
  }

  const email = extractEmailFromQuery(trimmed);
  if (!email) {
    return { ok: false, query: trimmed, error: "Invalid or disallowed query" };
  }

  const apiKey = process.env.HIBP_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      query: trimmed,
      error:
        "HIBP_API_KEY is not available in this deployment. On Vercel, add it for Preview (branch deploys) and Production, then redeploy.",
      status: 503,
    };
  }

  const url = new URL(
    `${HIBP_API_BASE_URL}/breachedaccount/${encodeURIComponent(email)}`,
  );
  url.searchParams.set("truncateResponse", "false");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "hibp-api-key": apiKey,
        "user-agent": HIBP_USER_AGENT,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 404) {
      return { ok: true, query: trimmed, email, breaches: [] };
    }

    if (!response.ok) {
      const retryAfter = response.headers.get("retry-after");
      let message = `HIBP API returned ${response.status}`;
      if (response.status === 429 && retryAfter) {
        message = `HIBP rate limit exceeded. Retry after ${retryAfter} seconds.`;
      } else {
        const body = await response.text().catch(() => "");
        if (body && body.length <= 200) {
          message = body;
        }
      }
      return { ok: false, query: trimmed, error: message, status: response.status };
    }

    const data = await response.json();
    const breaches = parseBreaches(data);
    breaches.sort((a, b) => b.BreachDate.localeCompare(a.BreachDate));

    return { ok: true, query: trimmed, email, breaches };
  } catch {
    return { ok: false, query: trimmed, error: "Could not reach the HIBP API" };
  } finally {
    clearTimeout(timeout);
  }
}
