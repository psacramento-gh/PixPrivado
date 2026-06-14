import { NextRequest, NextResponse } from "next/server";
import { isCpfSearchQuery } from "@/lib/br/cpf-query";
import { searchBreaches } from "@/lib/breach/api-search";
import { isAllowedBreachQuery } from "@/lib/breach/build-query";
import { fetchReceitaFederal } from "@/lib/receita/api-fetch";
import { isCnpjSearchQuery, normalizeCnpjDigits } from "@/lib/receita/is-cnpj-query";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (isCpfSearchQuery(query)) {
    return NextResponse.json(
      { error: "CPF values open Portal da Transparência links in the app." },
      { status: 400 },
    );
  }

  const cnpjDigits = normalizeCnpjDigits(query);
  if (isCnpjSearchQuery(query) || cnpjDigits.length === 14) {
    const result = await fetchReceitaFederal(cnpjDigits);
    return NextResponse.json({ kind: "cnpj", query: cnpjDigits, result });
  }

  if (!isAllowedBreachQuery(query)) {
    return NextResponse.json(
      { error: "Invalid or disallowed query. Only email breach lookups are supported." },
      { status: 400 },
    );
  }

  const result = await searchBreaches(query);
  return NextResponse.json({ kind: "breach", query, result });
}
