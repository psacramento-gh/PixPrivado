export type DddLookupResult = {
  state: string;
  cities: string[];
};

const BRASIL_API_DDD = "https://brasilapi.com.br/api/ddd/v1";

export async function fetchDddFromBrasilApi(
  ddd: number,
  signal?: AbortSignal,
): Promise<DddLookupResult> {
  const response = await fetch(`${BRASIL_API_DDD}/${ddd}`, {
    headers: { Accept: "application/json" },
    signal,
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`DDD lookup failed (${response.status})`);
  }

  const body = (await response.json()) as DddLookupResult;
  if (!body.state || !Array.isArray(body.cities)) {
    throw new Error("Invalid DDD response");
  }

  return body;
}
