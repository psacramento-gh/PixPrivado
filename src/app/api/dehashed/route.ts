import { NextRequest, NextResponse } from "next/server";
import { isAllowedDehashedQuery } from "@/lib/dehashed/build-query";
import { DEHASHED_API_URL } from "@/lib/dehashed/constants";
import { buildDehashedWebSearchUrl } from "@/lib/dehashed/web-url";

const SEARCH_TIMEOUT_MS = 15_000;

export async function POST(request: NextRequest) {
  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query || !isAllowedDehashedQuery(query)) {
    return NextResponse.json({ error: "Invalid or disallowed query" }, { status: 400 });
  }

  const apiKey = process.env.DEHASHED_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Dehashed API is not configured", url: buildDehashedWebSearchUrl(query) },
      { status: 503 },
    );
  }

  const webUrl = buildDehashedWebSearchUrl(query);
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
        query,
        page: 1,
        size: 1,
        wildcard: false,
        regex: false,
        de_dupe: true,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ url: webUrl });
    }

    return NextResponse.json({ url: webUrl });
  } catch {
    return NextResponse.json({ url: webUrl });
  } finally {
    clearTimeout(timeout);
  }
}
