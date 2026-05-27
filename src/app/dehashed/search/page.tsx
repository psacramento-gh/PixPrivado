import { searchDehashed } from "@/lib/dehashed/api-search";
import { DehashedResultsView } from "@/components/dehashed-results-view";

export const dynamic = "force-dynamic";

function parsePageParam(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export default async function DehashedSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = parsePageParam(pageParam);

  if (!query) {
    return <DehashedResultsView query="" result={null} />;
  }

  const result = await searchDehashed(query, { page });

  return <DehashedResultsView query={query} result={result} />;
}
