import type { Locale } from "@/lib/brcode/labels";

export const APP_DISPLAY_NAME_EN = "Pix Private";
export const APP_DISPLAY_NAME_PT = "Pix Privado";

/** Default English product name for static metadata and non-locale contexts. */
export const APP_DISPLAY_NAME = APP_DISPLAY_NAME_EN;

export function getAppDisplayName(locale: Locale): string {
  return locale === "pt" ? APP_DISPLAY_NAME_PT : APP_DISPLAY_NAME_EN;
}

export const APP_HOME_ARIA_LABEL_EN = `${APP_DISPLAY_NAME_EN} — start a new submission`;

export const APP_HOME_ARIA_LABEL_PT = `${APP_DISPLAY_NAME_PT} — iniciar nova decodificação`;

export const APP_METADATA_DESCRIPTION =
  "Explore what Pix BR Code QR payloads and Copia e Cola strings reveal—from images or pasted text.";

export const APP_ABOUT_METADATA_DESCRIPTION =
  "Why Pix Private exists, what it does, and how to use it responsibly for privacy awareness.";
