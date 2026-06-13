import { NextRequest, NextResponse } from "next/server";
import { searchBreaches } from "@/lib/breach/api-search";
import { isAllowedBreachQuery } from "@/lib/breach/build-query";

export async function POST(request: NextRequest) {
  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query || !isAllowedBreachQuery(query)) {
    return NextResponse.json({ error: "Invalid or disallowed query" }, { status: 400 });
  }

  const result = await searchBreaches(query);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 502 },
    );
  }

  return NextResponse.json({
    total: result.breaches.length,
  });
}
