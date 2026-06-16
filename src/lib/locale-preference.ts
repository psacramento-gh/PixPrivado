import type { Locale } from "@/lib/brcode/labels";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/locale-constants";

const LEGACY_BUNDLE_KEY = "pix-decoder:last-decode";

function parseLocale(value: string | null | undefined): Locale | null {
  return value === "pt" || value === "en" ? value : null;
}

function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;

  const escaped = LOCALE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escaped}=(en|pt)(?:;|$)`),
  );
  return parseLocale(match?.[1]);
}

function writeLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;

  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function readLocalePreference(): Locale {
  if (typeof window === "undefined") return "en";

  try {
    const stored = parseLocale(localStorage.getItem(LOCALE_COOKIE));
    if (stored) return stored;
  } catch {
    // Ignore private mode / quota errors.
  }

  const fromCookie = readLocaleCookie();
  if (fromCookie) return fromCookie;

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
    localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // Ignore.
  }

  writeLocaleCookie(locale);
}
