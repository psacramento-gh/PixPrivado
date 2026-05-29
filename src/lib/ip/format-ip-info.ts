import type { IpLookupResult } from "@/lib/ip/freeip-api";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

export function ipCompactLabel(data: IpLookupResult): string {
  const city = data.cityName?.trim();
  const country = data.countryCode?.trim() || data.countryName?.trim();
  if (city && country) return `${city} · ${country}`;
  if (city) return city;
  if (country) return country;
  return data.ipAddress;
}

export function ipOpenStreetMapUrl(data: IpLookupResult): string {
  const { latitude, longitude } = data;
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`;
  }

  const query = [data.cityName, data.regionName, data.countryName]
    .filter((part) => part?.trim())
    .join(", ");

  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

export function ipDetailLines(data: IpLookupResult, locale: Locale): string[] {
  const lines: string[] = [];

  const locality = [
    data.cityName?.trim(),
    data.regionName?.trim(),
    data.countryName?.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  if (locality) lines.push(locality);
  if (data.zipCode?.trim()) {
    lines.push(`${t(locale, "ipPostalCode")}: ${data.zipCode.trim()}`);
  }
  if (data.continent?.trim()) {
    lines.push(`${t(locale, "ipContinent")}: ${data.continent.trim()}`);
  }
  if (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
    lines.push(
      `${t(locale, "ipCoordinates")}: ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
    );
  }
  if (data.asn?.trim()) {
    const org = data.asnOrganization?.trim();
    lines.push(
      org
        ? `${t(locale, "ipAsn")}: AS${data.asn.trim()} · ${org}`
        : `${t(locale, "ipAsn")}: AS${data.asn.trim()}`,
    );
  }
  if (data.isProxy === true) {
    lines.push(t(locale, "ipProxyDetected"));
  }

  return lines;
}

export function ipTimeZonePreview(data: IpLookupResult, max = 4): string | null {
  const zones = data.timeZones?.filter(Boolean);
  if (!zones?.length) return null;
  const shown = zones.slice(0, max);
  const suffix = zones.length > max ? ` (+${zones.length - max})` : "";
  return shown.join(", ") + suffix;
}
