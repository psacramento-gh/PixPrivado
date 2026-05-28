"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { MccCategoryBadge } from "@/components/mcc-category-badge";
import { lookupMccDescription, parseMccCode } from "@/lib/br/mcc/lookup";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type MccEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Wraps EMV tag 52 with a merchant category badge when the MCC is known. */
export function MccEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: MccEnrichedValueProps) {
  const mccCode = active ? parseMccCode(rawValue) : null;

  if (mccCode === null) {
    return <>{children}</>;
  }

  const description = lookupMccDescription(rawValue);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      {description ? (
        <MccCategoryBadge
          mccCode={mccCode}
          description={description}
          locale={locale}
        />
      ) : (
        <Badge variant="outline" className="font-sans text-muted-foreground">
          {t(locale, "mccUnknown", { code: mccCode })}
        </Badge>
      )}
    </span>
  );
}
