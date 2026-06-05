import { NextRequest, NextResponse } from "next/server";
import { searchDehashed } from "@/lib/dehashed/api-search";
import { isAllowedDehashedQuery } from "@/lib/dehashed/build-query";

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

  const result = await searchDehashed(query, { size: 1 });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 502 },
    );
  }

  return NextResponse.json({
    total: result.total,
  });
}
