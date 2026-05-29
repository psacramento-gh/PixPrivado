import { formatCityName } from "@/lib/br/format-city-name";

export type CnaeSubclassLookupResult = {
  id: string;
  descricao: string;
  descricaoFormatted: string;
  atividades: string[];
  classe: { id: string; descricao: string } | null;
};

const IBGE_CNAE_SUBCLASS = "https://servicodados.ibge.gov.br/api/v2/cnae/subclasses";

const CNAE_REVALIDATE_SECONDS = 60 * 60 * 24 * 90;

type IbgeCnaeSubclass = {
  id: string;
  descricao: string;
  atividades?: string[];
  classe?: {
    id: string;
    descricao: string;
  };
};

function isIbgeSubclass(value: unknown): value is IbgeCnaeSubclass {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as IbgeCnaeSubclass).id === "string" &&
    typeof (value as IbgeCnaeSubclass).descricao === "string"
  );
}

function toLookupResult(entry: IbgeCnaeSubclass): CnaeSubclassLookupResult {
  const atividades = Array.isArray(entry.atividades)
    ? entry.atividades.map((item) => formatCityName(String(item)))
    : [];

  return {
    id: entry.id,
    descricao: entry.descricao,
    descricaoFormatted: formatCityName(entry.descricao),
    atividades,
    classe:
      entry.classe &&
      typeof entry.classe.id === "string" &&
      typeof entry.classe.descricao === "string"
        ? {
            id: entry.classe.id,
            descricao: formatCityName(entry.classe.descricao),
          }
        : null,
  };
}

export async function fetchCnaeSubclassFromIbge(
  cnaeDigits: string,
  signal?: AbortSignal,
): Promise<CnaeSubclassLookupResult> {
  const response = await fetch(`${IBGE_CNAE_SUBCLASS}/${cnaeDigits}`, {
    headers: { Accept: "application/json" },
    signal,
    next: { revalidate: CNAE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`CNAE lookup failed (${response.status})`);
  }

  const body: unknown = await response.json();

  if (Array.isArray(body)) {
    const first = body.find(isIbgeSubclass);
    if (!first) {
      throw new Error("CNAE not found");
    }
    return toLookupResult(first);
  }

  if (!isIbgeSubclass(body)) {
    throw new Error("Invalid CNAE response");
  }

  return toLookupResult(body);
}
