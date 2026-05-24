import { searchDehashed } from "@/lib/dehashed/api-search";
import { DehashedResultsView } from "@/components/dehashed-results-view";

export const dynamic = "force-dynamic";

export default async function DehashedSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  if (!query) {
    return <DehashedResultsView query="" result={null} />;
  }

  const result = await searchDehashed(query);

  return <DehashedResultsView query={query} result={result} />;
}
