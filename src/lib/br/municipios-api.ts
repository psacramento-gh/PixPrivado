import { formatCityName } from "@/lib/br/format-city-name";
import {
  normalizeCityForMatch,
  parseBrazilianUfParam,
  parseMerchantCityQuery,
} from "@/lib/br/normalize-city-query";

export type MunicipioLookupResult = {
  id: number;
  nome: string;
  nomeFormatted: string;
  uf: string;
};

export type MunicipiosSearchResult = {
  query: string;
  matches: MunicipioLookupResult[];
};

type MunicipioIndexEntry = {
  id: number;
  nome: string;
  nomeNormalized: string;
  uf: string;
};

type IbgeMunicipioNivelado = {
  "municipio-id": number;
  "municipio-nome": string;
  "UF-sigla": string;
};

const IBGE_MUNICIPIOS =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado&orderBy=nome";

const MUNICIPIOS_REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

let municipioIndexPromise: Promise<MunicipioIndexEntry[]> | null = null;

function isIbgeMunicipioNivelado(value: unknown): value is IbgeMunicipioNivelado {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as IbgeMunicipioNivelado)["municipio-id"] === "number" &&
    typeof (value as IbgeMunicipioNivelado)["municipio-nome"] === "string" &&
    typeof (value as IbgeMunicipioNivelado)["UF-sigla"] === "string"
  );
}

function toIndexEntry(entry: IbgeMunicipioNivelado): MunicipioIndexEntry {
  const nome = entry["municipio-nome"].trim();
  return {
    id: entry["municipio-id"],
    nome,
    nomeNormalized: normalizeCityForMatch(nome),
    uf: entry["UF-sigla"].trim().toUpperCase(),
  };
}

async function fetchMunicipioIndex(signal?: AbortSignal): Promise<MunicipioIndexEntry[]> {
  const response = await fetch(IBGE_MUNICIPIOS, {
    headers: { Accept: "application/json" },
    signal,
    next: { revalidate: MUNICIPIOS_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Municipios lookup failed (${response.status})`);
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error("Invalid municipios response");
  }

  return body.filter(isIbgeMunicipioNivelado).map(toIndexEntry);
}

async function getMunicipioIndex(signal?: AbortSignal): Promise<MunicipioIndexEntry[]> {
  if (!municipioIndexPromise) {
    municipioIndexPromise = fetchMunicipioIndex(signal).catch((error) => {
      municipioIndexPromise = null;
      throw error;
    });
  }
  return municipioIndexPromise;
}

export async function searchMunicipiosByName(
  rawQuery: string,
  options?: { uf?: string | null; signal?: AbortSignal },
): Promise<MunicipiosSearchResult | null> {
  const query = parseMerchantCityQuery(rawQuery);
  if (query === null) {
    return null;
  }

  const ufFilter = parseBrazilianUfParam(options?.uf);
  const index = await getMunicipioIndex(options?.signal);

  const matches: MunicipioLookupResult[] = [];
  for (const entry of index) {
    if (ufFilter !== null && entry.uf !== ufFilter) {
      continue;
    }
    if (!entry.nomeNormalized.includes(query)) {
      continue;
    }
    matches.push({
      id: entry.id,
      nome: entry.nome,
      nomeFormatted: formatCityName(entry.nome),
      uf: entry.uf,
    });
  }

  matches.sort((a, b) => {
    const byName = a.nomeFormatted.localeCompare(b.nomeFormatted, "pt-BR");
    if (byName !== 0) return byName;
    return a.uf.localeCompare(b.uf, "pt-BR");
  });

  return { query, matches };
}
