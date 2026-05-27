import type { Locale } from "@/lib/brcode/labels";

const LOCALE_KEY = "pix-decoder:locale";
const LEGACY_BUNDLE_KEY = "pix-decoder:last-decode";

export function readLocalePreference(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "pt" || stored === "en") return stored;
  } catch {
    // Ignore private mode / quota errors.
  }
  try {
    const raw = localStorage.getItem(LEGACY_BUNDLE_KEY);
    if (!raw) return "en";
    const parsed = JSON.parse(raw) as { locale?: string };
    return parsed.locale === "pt" ? "pt" : "en";
  } catch {
    return "en";
  }
}

export function writeLocalePreference(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Ignore.
  }
}
