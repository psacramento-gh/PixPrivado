import { readFile } from "node:fs/promises";
import path from "node:path";
import { hasFlag } from "country-flag-icons";
import { NextRequest, NextResponse } from "next/server";
import { normalizeIso3166Alpha2 } from "@/lib/country/iso3166";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const alpha2 = normalizeIso3166Alpha2(code.replace(/\.svg$/i, ""));
  if (!alpha2 || !hasFlag(alpha2)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "node_modules/country-flag-icons/3x2",
    `${alpha2}.svg`,
  );

  try {
    const svg = await readFile(filePath, "utf8");
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
