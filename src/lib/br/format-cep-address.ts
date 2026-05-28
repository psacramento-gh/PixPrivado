import type { CepLookupResult } from "@/lib/br/cep-api";
import { getBrazilianStateDisplayName } from "@/lib/br/brazilian-state-names";
import { formatCityName } from "@/lib/br/format-city-name";
import { formatCepDigits } from "@/lib/br/normalize-cep";
import type { Locale } from "@/lib/brcode/labels";

export function cepCompactLabel(data: CepLookupResult, locale: Locale): string {
  const city = formatCityName(data.city);
  const state = getBrazilianStateDisplayName(data.state, locale);
  return `${city} · ${state}`;
}

export function cepAddressLines(data: CepLookupResult, locale: Locale): string[] {
  const lines: string[] = [];
  if (data.street?.trim()) lines.push(data.street.trim());
  if (data.neighborhood?.trim()) lines.push(data.neighborhood.trim());
  const city = formatCityName(data.city);
  const state = getBrazilianStateDisplayName(data.state, locale);
  lines.push(`${city} — ${state}`);
  lines.push(formatCepDigits(data.cep.replace(/\D/g, "")));
  return lines;
}

export function cepOpenStreetMapUrl(data: CepLookupResult): string {
  const coords = data.location?.coordinates;
  const lat = coords?.latitude ? Number.parseFloat(coords.latitude) : Number.NaN;
  const lon = coords?.longitude ? Number.parseFloat(coords.longitude) : Number.NaN;

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  }

  const query = [data.street, data.neighborhood, data.city, data.state, data.cep]
    .filter((part) => part?.trim())
    .join(", ");

  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}
