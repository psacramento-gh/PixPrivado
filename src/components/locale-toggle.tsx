"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/lib/brcode/labels";

export function LocaleToggle({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <Tabs
      value={locale}
      onValueChange={(value) => {
        if (value === "en" || value === "pt") {
          onLocaleChange(value);
        }
      }}
      className="gap-0"
      aria-label="Language"
    >
      <TabsList className="h-8">
        <TabsTrigger value="en" className="px-2.5 text-xs">
          ENG
        </TabsTrigger>
        <TabsTrigger value="pt" className="px-2.5 text-xs">
          PT-BR
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
