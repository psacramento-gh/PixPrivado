import { fetchCpfHub, normalizeCpfDigits } from "@/lib/cpfhub/api-fetch";
import { isCpfSearchQuery } from "@/lib/cpfhub/is-cpf-query";
import { sanitizeSearchReturnPath } from "@/lib/dehashed/results-url";
import { CpfHubResultsView } from "@/components/cpfhub-results-view";

export const dynamic = "force-dynamic";

export default async function CpfSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; back?: string }>;
}) {
  const { q, back: backParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const backHref =
    sanitizeSearchReturnPath(typeof backParam === "string" ? backParam : null) ?? "/";

  if (!query) {
    return <CpfHubResultsView query="" result={null} backHref={backHref} />;
  }

  const digits = normalizeCpfDigits(query);
  if (!isCpfSearchQuery(digits)) {
    return (
      <CpfHubResultsView
        query={query}
        result={{
          ok: false,
          cpf: digits,
          error: "CPF must be 11 digits.",
          status: 400,
        }}
        backHref={backHref}
      />
    );
  }

  const result = await fetchCpfHub(digits);
  return <CpfHubResultsView query={digits} result={result} backHref={backHref} />;
}
