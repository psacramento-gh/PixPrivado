import {
  buildReceitaApiUrl,
  OPENCNPJ_RECEITA_REVALIDATE_SECONDS,
  RECEITA_FETCH_TIMEOUT_MS,
} from "./constants";
import { normalizeCnpjDigits } from "./is-cnpj-query";

export type ReceitaFetchResult =
  | {
      ok: true;
      cnpj: string;
      data: Record<string, unknown>;
    }
  | {
      ok: false;
      cnpj: string;
      error: "not_found" | "unavailable";
      status?: number;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function fetchReceitaFederal(query: string): Promise<ReceitaFetchResult> {
  const cnpj = normalizeCnpjDigits(query.trim());
  if (cnpj.length !== 14) {
    return { ok: false, cnpj, error: "unavailable" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RECEITA_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(buildReceitaApiUrl(cnpj), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: OPENCNPJ_RECEITA_REVALIDATE_SECONDS },
    });

    const body: unknown = await response.json().catch(() => null);

    if (response.status === 404) {
      return { ok: false, cnpj, error: "not_found", status: 404 };
    }

    if (!response.ok) {
      return { ok: false, cnpj, error: "unavailable", status: response.status };
    }

    if (isRecord(body) && typeof body.error === "string") {
      const message = body.error.toLowerCase();
      if (message.includes("not found")) {
        return { ok: false, cnpj, error: "not_found", status: response.status };
      }
      return { ok: false, cnpj, error: "unavailable", status: response.status };
    }

    if (!isRecord(body)) {
      return { ok: false, cnpj, error: "unavailable", status: response.status };
    }

    return { ok: true, cnpj, data: body };
  } catch {
    return { ok: false, cnpj, error: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
