import { NextRequest, NextResponse } from "next/server";
import { fetchCepFromBrasilApi } from "@/lib/br/cep-api";
import { parseCepDigits } from "@/lib/br/normalize-cep";

const FETCH_TIMEOUT_MS = 12_000;

export async function GET(request: NextRequest) {
  const cepDigits = parseCepDigits(request.nextUrl.searchParams.get("cep") ?? "");
  if (cepDigits === null) {
    return NextResponse.json({ error: "Invalid CEP parameter" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const data = await fetchCepFromBrasilApi(cepDigits, controller.signal);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch CEP information";
    const status = message === "CEP not found" ? 404 : 502;
    return NextResponse.json({ error: message, cep: cepDigits }, { status });
  } finally {
    clearTimeout(timeout);
  }
}
