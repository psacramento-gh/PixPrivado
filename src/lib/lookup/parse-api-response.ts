import type { BreachSearchResult } from "@/lib/breach/api-search";
import type { ReceitaFetchResult } from "@/lib/receita/api-fetch";
import type { LookupApiResponse } from "./panel-types";

function isReceitaFetchResult(value: unknown): value is ReceitaFetchResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    "cnpj" in value &&
    typeof (value as ReceitaFetchResult).cnpj === "string"
  );
}

export function isTopLevelLookupError(
  json: unknown,
): json is { error: string } {
  if (isReceitaFetchResult(json)) return false;
  return (
    typeof json === "object" &&
    json !== null &&
    "error" in json &&
    typeof (json as { error: unknown }).error === "string" &&
    !("kind" in json)
  );
}

export function normalizeLookupApiResponse(json: unknown): LookupApiResponse | null {
  if (typeof json !== "object" || json === null) return null;

  if ("kind" in json && "result" in json && "query" in json) {
    const kind = (json as { kind: unknown }).kind;
    if (kind === "cnpj" || kind === "breach") {
      return json as LookupApiResponse;
    }
  }

  if (isReceitaFetchResult(json)) {
    const receita = json;
    return { kind: "cnpj", query: receita.cnpj, result: receita };
  }

  const maybeBreach = json as BreachSearchResult;
  if (
    "ok" in maybeBreach &&
    "query" in maybeBreach &&
    ("breaches" in maybeBreach || "error" in maybeBreach)
  ) {
    return { kind: "breach", query: maybeBreach.query, result: maybeBreach };
  }

  return null;
}
