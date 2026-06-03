"use client";

import type { ReactNode } from "react";
import { IbgeMunicipiosBadge } from "@/components/ibge-municipios-badge";
import { parseMerchantCityQuery } from "@/lib/br/normalize-city-query";
import type { Locale } from "@/lib/brcode/labels";

type MerchantCityEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Wraps merchant city (tag 60) with IBGE municipality matches when `active`. */
export function MerchantCityEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: MerchantCityEnrichedValueProps) {
  const cityQuery = active ? parseMerchantCityQuery(rawValue) : null;

  if (cityQuery === null) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      <IbgeMunicipiosBadge
        key={cityQuery}
        cityQuery={cityQuery}
        displayQuery={rawValue.trim()}
        locale={locale}
      />
    </span>
  );
}
