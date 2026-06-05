import { NextRequest, NextResponse } from "next/server";
import { fetchCpfHub, normalizeCpfDigits } from "@/lib/cpfhub/api-fetch";
import { isCpfSearchQuery } from "@/lib/cpfhub/is-cpf-query";
import { searchDehashed } from "@/lib/dehashed/api-search";
import { dehashedPageExceedsTotal, dehashedTotalPages } from "@/lib/dehashed/pagination";
import { DEHASHED_PAGE_SIZE } from "@/lib/dehashed/constants";
import { isCnpjSearchQuery } from "@/lib/receita/is-cnpj-query";
import { fetchReceitaFederal } from "@/lib/receita/api-fetch";

function parsePageParam(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const page = parsePageParam(request.nextUrl.searchParams.get("page"));

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (isCpfSearchQuery(query)) {
    const digits = normalizeCpfDigits(query);
    if (!isCpfSearchQuery(digits)) {
      return NextResponse.json({
        kind: "cpf",
        query,
        result: {
          ok: false,
          cpf: digits,
          error: "CPF must be 11 digits.",
          status: 400,
        },
      });
    }
    const result = await fetchCpfHub(digits);
    return NextResponse.json({ kind: "cpf", query: digits, result });
  }

  if (isCnpjSearchQuery(query)) {
    const result = await fetchReceitaFederal(query);
    return NextResponse.json({ kind: "cnpj", query, result });
  }

  const result = await searchDehashed(query, { page });

  if (
    result.ok &&
    dehashedPageExceedsTotal(page, result.total, result.pageSize ?? DEHASHED_PAGE_SIZE)
  ) {
    const lastPage = dehashedTotalPages(
      result.total,
      result.pageSize ?? DEHASHED_PAGE_SIZE,
    );
    const corrected = await searchDehashed(query, { page: lastPage });
    return NextResponse.json({ kind: "dehashed", query, result: corrected });
  }

  return NextResponse.json({ kind: "dehashed", query, result });
}
