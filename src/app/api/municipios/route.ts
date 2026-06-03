import { NextRequest, NextResponse } from "next/server";
import { parseMerchantCityQuery } from "@/lib/br/normalize-city-query";
import { searchMunicipiosByName } from "@/lib/br/municipios-api";

const FETCH_TIMEOUT_MS = 15_000;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (parseMerchantCityQuery(q) === null) {
    return NextResponse.json({ error: "Invalid municipios query" }, { status: 400 });
  }

  const uf = request.nextUrl.searchParams.get("uf");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const data = await searchMunicipiosByName(q, {
      uf,
      signal: controller.signal,
    });
    if (data === null) {
      return NextResponse.json({ error: "Invalid municipios query" }, { status: 400 });
    }
    if (data.matches.length === 0) {
      return NextResponse.json({ error: "No municipalities matched", query: data.query }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch municipality information";
    return NextResponse.json({ error: message, query: q.trim() }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
