import { NextRequest, NextResponse } from "next/server";
import { fetchCnaeSubclassFromIbge } from "@/lib/br/cnae-api";
import { parseCnaeDigits } from "@/lib/br/parse-cnae";

const FETCH_TIMEOUT_MS = 12_000;

export async function GET(request: NextRequest) {
  const cnaeDigits = parseCnaeDigits(request.nextUrl.searchParams.get("code") ?? "");
  if (cnaeDigits === null) {
    return NextResponse.json({ error: "Invalid CNAE parameter" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const data = await fetchCnaeSubclassFromIbge(cnaeDigits, controller.signal);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch CNAE information";
    const status = message === "CNAE not found" ? 404 : 502;
    return NextResponse.json({ error: message, code: cnaeDigits }, { status });
  } finally {
    clearTimeout(timeout);
  }
}
