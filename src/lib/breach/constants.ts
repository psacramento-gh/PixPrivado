export const HIBP_API_BASE_URL = "https://haveibeenpwned.com/api/v3";

export const HIBP_USER_AGENT = "Pix Privacy Explorer/1.0";

export const HIBP_LOGO_BASE_URL = "https://logos.haveibeenpwned.com";

export function buildBreachLogoUrl(logoPath: string): string {
  const trimmed = logoPath.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return `${HIBP_LOGO_BASE_URL}/${trimmed.replace(/^\//, "")}`;
}

export const PIX_GUI = "br.gov.bcb.pix";
