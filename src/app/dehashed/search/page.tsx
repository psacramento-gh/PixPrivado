import { DehashedResultsView } from "@/components/dehashed-results-view";
import { ReceitaFederalResultsView } from "@/components/receita-federal-results-view";
import { searchDehashed } from "@/lib/dehashed/api-search";
import { sanitizeSearchReturnPath } from "@/lib/dehashed/results-url";
import { fetchReceitaFederal } from "@/lib/receita/api-fetch";
import { isCnpjSearchQuery } from "@/lib/receita/is-cnpj-query";

export const dynamic = "force-dynamic";

function parsePageParam(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export default async function DehashedSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; back?: string }>;
}) {
  const { q, page: pageParam, back: backParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = parsePageParam(pageParam);
  const backHref =
    sanitizeSearchReturnPath(
      typeof backParam === "string" ? backParam : null,
    ) ?? "/";

  if (!query) {
    return <DehashedResultsView query="" result={null} backHref={backHref} />;
  }

  if (isCnpjSearchQuery(query)) {
    const receitaResult = await fetchReceitaFederal(query);
    return <ReceitaFederalResultsView query={query} result={receitaResult} />;
  }

  const result = await searchDehashed(query, { page });

  return (
    <DehashedResultsView query={query} result={result} backHref={backHref} />
  );
}
