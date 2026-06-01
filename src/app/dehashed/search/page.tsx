import { redirect } from "next/navigation";
import { DehashedResultsView } from "@/components/dehashed-results-view";
import { ReceitaFederalResultsView } from "@/components/receita-federal-results-view";
import { searchDehashed } from "@/lib/dehashed/api-search";
import { dehashedPageExceedsTotal, dehashedTotalPages } from "@/lib/dehashed/pagination";
import {
  buildDehashedResultsPageUrl,
  sanitizeSearchReturnPath,
} from "@/lib/dehashed/results-url";
import { DEHASHED_PAGE_SIZE } from "@/lib/dehashed/constants";
import { fetchReceitaFederal } from "@/lib/receita/api-fetch";
import { isCpfSearchQuery } from "@/lib/cpfhub/is-cpf-query";
import { buildCpfResultsPageUrl } from "@/lib/cpfhub/results-url";
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

  if (isCpfSearchQuery(query)) {
    redirect(
      buildCpfResultsPageUrl(query, {
        returnTo: backHref === "/" ? null : backHref,
      }),
    );
  }

  if (isCnpjSearchQuery(query)) {
    const receitaResult = await fetchReceitaFederal(query);
    return <ReceitaFederalResultsView query={query} result={receitaResult} />;
  }

  const result = await searchDehashed(query, { page });

  if (
    result.ok &&
    dehashedPageExceedsTotal(page, result.total, result.pageSize ?? DEHASHED_PAGE_SIZE)
  ) {
    redirect(
      buildDehashedResultsPageUrl(
        query,
        dehashedTotalPages(result.total, result.pageSize ?? DEHASHED_PAGE_SIZE),
        { returnTo: backHref === "/" ? null : backHref },
      ),
    );
  }

  return (
    <DehashedResultsView query={query} result={result} backHref={backHref} />
  );
}
