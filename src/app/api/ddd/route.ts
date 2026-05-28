import { NextRequest, NextResponse } from "next/server";
import { fetchDddFromBrasilApi } from "@/lib/br/ddd-api";

const FETCH_TIMEOUT_MS = 12_000;

function parseDddParam(raw: string | null): number | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 2) return null;
  const ddd = Number.parseInt(digits, 10);
  if (!Number.isFinite(ddd) || ddd < 10 || ddd > 99) return null;
  return ddd;
}

export async function GET(request: NextRequest) {
  const ddd = parseDddParam(request.nextUrl.searchParams.get("ddd"));
  if (ddd === null) {
    return NextResponse.json({ error: "Invalid DDD parameter" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const data = await fetchDddFromBrasilApi(ddd, controller.signal);
    return NextResponse.json({ ddd, ...data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch DDD information";
    return NextResponse.json({ error: message, ddd }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
