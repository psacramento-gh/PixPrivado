"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/brcode/labels";

export function LocaleToggle({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => onLocaleChange(locale === "en" ? "pt" : "en")}
      aria-label={locale === "en" ? "Switch to Portuguese" : "Switch to English"}
      title={locale === "en" ? "PT" : "EN"}
    >
      <Languages className="size-4" />
    </Button>
  );
}
