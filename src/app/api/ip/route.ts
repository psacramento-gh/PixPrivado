import { NextRequest, NextResponse } from "next/server";
import { fetchIpFromFreeIpApi } from "@/lib/ip/freeip-api";
import { parseIpAddress } from "@/lib/ip/parse-ip";

const FETCH_TIMEOUT_MS = 12_000;

export async function GET(request: NextRequest) {
  const ip = parseIpAddress(request.nextUrl.searchParams.get("ip") ?? "");
  if (ip === null) {
    return NextResponse.json({ error: "Invalid IP parameter" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const data = await fetchIpFromFreeIpApi(ip, controller.signal);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch IP information";
    const status = message === "IP not found" ? 404 : 502;
    return NextResponse.json({ error: message, ip }, { status });
  } finally {
    clearTimeout(timeout);
  }
}
