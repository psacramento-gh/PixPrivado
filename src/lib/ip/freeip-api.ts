export type IpLookupResult = {
  ipVersion: number;
  ipAddress: string;
  latitude: number;
  longitude: number;
  countryName: string;
  countryCode: string;
  capital?: string;
  phoneCodes?: number[];
  timeZones?: string[];
  zipCode?: string;
  cityName?: string;
  regionName?: string;
  regionCode?: string;
  continent?: string;
  continentCode?: string;
  currencies?: string[];
  languages?: string[];
  asn?: string;
  asnOrganization?: string;
  isProxy?: boolean;
};

const FREEIP_API_BASE = "https://free.freeipapi.com/api/json";

export async function fetchIpFromFreeIpApi(
  ip: string,
  signal?: AbortSignal,
): Promise<IpLookupResult> {
  const response = await fetch(`${FREEIP_API_BASE}/${encodeURIComponent(ip)}`, {
    headers: { Accept: "application/json" },
    signal,
    redirect: "follow",
    next: { revalidate: 60 * 60 * 24 },
  });

  if (response.status === 404) {
    throw new Error("IP not found");
  }

  if (!response.ok) {
    throw new Error(`IP lookup failed (${response.status})`);
  }

  const body = (await response.json()) as IpLookupResult;
  if (!body.ipAddress || !body.countryName) {
    throw new Error("Invalid IP response");
  }

  return body;
}
