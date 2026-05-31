"use client";

import type { ReactNode } from "react";
import { PhoneDddBadges } from "@/components/phone-ddd-badges";
import { WhatsAppIconLink } from "@/components/whatsapp-icon-link";
import { extractDddFromPhone } from "@/lib/br/extract-ddd";
import { getWhatsAppLinksFromValue } from "@/lib/br/whatsapp-link";
import type { Locale } from "@/lib/brcode/labels";
import { classifyPixKey } from "@/lib/dehashed/classify-pix-key";
import { parseIpAddress } from "@/lib/ip/parse-ip";

type PhoneEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  /** When false, never attach DDD badges (e.g. ip_address rows). Default true. */
  active?: boolean;
  children: ReactNode;
};

/** Wraps a phone value with DDD state and cities badges when applicable. */
export function PhoneEnrichedValue({
  rawValue,
  locale,
  active = true,
  children,
}: PhoneEnrichedValueProps) {
  if (!active || parseIpAddress(rawValue.trim())) {
    return <>{children}</>;
  }

  const kind = classifyPixKey(rawValue);
  const whatsappLinks =
    kind === "cpf" || kind === "cnpj" ? [] : getWhatsAppLinksFromValue(rawValue);
  const ddd = kind === "phone" ? extractDddFromPhone(rawValue) : null;

  if (whatsappLinks.length === 0 && ddd === null) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      {whatsappLinks.map((link) => (
        <WhatsAppIconLink
          key={link.e164}
          url={link.url}
          phoneLabel={link.display}
          locale={locale}
        />
      ))}
      {ddd !== null ? <PhoneDddBadges key={ddd} ddd={ddd} locale={locale} /> : null}
    </span>
  );
}
