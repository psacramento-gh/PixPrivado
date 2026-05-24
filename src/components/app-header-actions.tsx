"use client";

import type { Locale } from "@/lib/brcode/labels";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeaderActions({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <>
      <LocaleToggle locale={locale} onLocaleChange={onLocaleChange} />
      <ThemeToggle />
    </>
  );
}
