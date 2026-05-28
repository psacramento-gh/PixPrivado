export type CepLookupResult = {
  cep: string;
  state: string;
  city: string;
  neighborhood?: string;
  street?: string;
  service?: string;
  timezoneName?: string | null;
  location?: {
    type?: string;
    coordinates?: {
      longitude?: string;
      latitude?: string;
    };
  };
};

const BRASIL_API_CEP = "https://brasilapi.com.br/api/cep/v2";

export async function fetchCepFromBrasilApi(
  cepDigits: string,
  signal?: AbortSignal,
): Promise<CepLookupResult> {
  const response = await fetch(`${BRASIL_API_CEP}/${cepDigits}`, {
    headers: { Accept: "application/json" },
    signal,
    next: { revalidate: 60 * 60 * 24 },
  });

  if (response.status === 404) {
    throw new Error("CEP not found");
  }

  if (!response.ok) {
    throw new Error(`CEP lookup failed (${response.status})`);
  }

  const body = (await response.json()) as CepLookupResult;
  if (!body.cep || !body.state || !body.city) {
    throw new Error("Invalid CEP response");
  }

  return body;
}
