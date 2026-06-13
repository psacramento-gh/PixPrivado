import type { DehashedSearchResult } from "@/lib/dehashed/api-search";
import type { ReceitaFetchResult } from "@/lib/receita/api-fetch";
import type { LookupKind } from "./kind";

export type LookupPanelRecord = {
  id: string;
  query: string;
  page: number;
  collapsed: boolean;
  status: "loading" | "ready" | "error";
  kind?: LookupKind;
  result?: ReceitaFetchResult | DehashedSearchResult;
  errorMessage?: string;
};

export type LookupApiResponse =
  | { kind: "cnpj"; query: string; result: ReceitaFetchResult }
  | { kind: "dehashed"; query: string; result: DehashedSearchResult };
