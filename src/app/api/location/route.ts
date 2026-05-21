import { NextRequest, NextResponse } from "next/server";

const MAX_URL_LENGTH = 77;
const FETCH_TIMEOUT_MS = 12_000;

function normalizeLocationUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;
  if (/^https?:\/\//i.test(trimmed)) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9](\/[a-zA-Z0-9._~:/?#\[\]@!$&'()*+,;=%-]*)?$/.test(trimmed)) {
    return null;
  }
  return `https://${trimmed}`;
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const target = normalizeLocationUrl(urlParam);
  if (!target) {
    return NextResponse.json({ error: "Invalid location URL" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return NextResponse.json({
      url: target,
      status: response.status,
      ok: response.ok,
      data: body,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch location";
    return NextResponse.json({ error: message, url: target }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
