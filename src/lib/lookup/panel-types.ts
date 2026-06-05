import type { CpfHubLookupResult } from "@/lib/cpfhub/types";
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
  result?: CpfHubLookupResult | ReceitaFetchResult | DehashedSearchResult;
  errorMessage?: string;
};

export type LookupApiResponse =
  | { kind: "cpf"; query: string; result: CpfHubLookupResult }
  | { kind: "cnpj"; query: string; result: ReceitaFetchResult }
  | { kind: "dehashed"; query: string; result: DehashedSearchResult };
