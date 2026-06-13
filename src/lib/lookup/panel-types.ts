import type { BreachSearchResult } from "@/lib/breach/api-search";
import type { ReceitaFetchResult } from "@/lib/receita/api-fetch";
import type { LookupKind } from "./kind";

export type LookupPanelRecord = {
  id: string;
  query: string;
  collapsed: boolean;
  status: "loading" | "ready" | "error";
  kind?: LookupKind;
  result?: ReceitaFetchResult | BreachSearchResult;
  errorMessage?: string;
};

export type LookupApiResponse =
  | { kind: "cnpj"; query: string; result: ReceitaFetchResult }
  | { kind: "breach"; query: string; result: BreachSearchResult };
