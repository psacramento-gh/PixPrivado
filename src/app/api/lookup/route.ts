import { NextRequest, NextResponse } from "next/server";
import { isCpfSearchQuery } from "@/lib/br/cpf-query";
import { searchBreaches } from "@/lib/breach/api-search";
import { isAllowedBreachQuery } from "@/lib/breach/build-query";
import { isCnpjSearchQuery } from "@/lib/receita/is-cnpj-query";
import { fetchReceitaFederal } from "@/lib/receita/api-fetch";

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

  if (isCnpjSearchQuery(query)) {
    const result = await fetchReceitaFederal(query);
    return NextResponse.json({ kind: "cnpj", query, result });
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
