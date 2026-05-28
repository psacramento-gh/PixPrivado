"use client";

import type { ReactNode } from "react";
import { PhoneDddBadges } from "@/components/phone-ddd-badges";
import { extractDddFromPhone } from "@/lib/br/extract-ddd";
import type { Locale } from "@/lib/brcode/labels";
import { classifyPixKey } from "@/lib/dehashed/classify-pix-key";

type PhoneEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  children: ReactNode;
};

/** Wraps a phone value with DDD state and cities badges when applicable. */
export function PhoneEnrichedValue({
  rawValue,
  locale,
  children,
}: PhoneEnrichedValueProps) {
  const kind = classifyPixKey(rawValue);
  const ddd = kind === "phone" ? extractDddFromPhone(rawValue) : null;

  if (ddd === null) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      <PhoneDddBadges key={ddd} ddd={ddd} locale={locale} />
    </span>
  );
}
