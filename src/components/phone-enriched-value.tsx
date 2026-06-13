"use client";

import { Fragment, type ReactNode } from "react";
import { LookupPhoneLink } from "@/components/lookup/lookup-phone-link";
import { PhoneDddBadges } from "@/components/phone-ddd-badges";
import { extractDddFromPhone } from "@/lib/br/extract-ddd";
import { getWhatsAppLinksFromValue } from "@/lib/br/whatsapp-link";
import type { Locale } from "@/lib/brcode/labels";
import { classifyPixKey } from "@/lib/pix/classify-pix-key";
import { parseIpAddress } from "@/lib/ip/parse-ip";

type PhoneEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  /** Visible label for the WhatsApp link; defaults to rawValue or children when string. */
  displayValue?: string;
  /** When false, never attach DDD badges (e.g. ip_address rows). Default true. */
  active?: boolean;
  children: ReactNode;
};

function renderWhatsAppLinks(
  links: ReturnType<typeof getWhatsAppLinksFromValue>,
  displayValue: string | undefined,
  children: ReactNode,
  locale: Locale,
) {
  if (links.length === 1) {
    const link = links[0]!;
    const label =
      displayValue ?? (typeof children === "string" ? children : link.display);
    return (
      <LookupPhoneLink displayValue={label} href={link.url} locale={locale} />
    );
  }

  return links.map((link, index) => (
    <Fragment key={link.e164}>
      {index > 0 ? <span>, </span> : null}
      <LookupPhoneLink displayValue={link.display} href={link.url} locale={locale} />
    </Fragment>
  ));
}

/** Wraps a phone value with WhatsApp link and DDD state badges when applicable. */
export function PhoneEnrichedValue({
  rawValue,
  locale,
  displayValue,
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

  const canReplaceWithWhatsApp =
    whatsappLinks.length > 0 &&
    (displayValue !== undefined || typeof children === "string");

  if (!canReplaceWithWhatsApp && whatsappLinks.length === 0 && ddd === null) {
    return <>{children}</>;
  }

  const phoneNode = canReplaceWithWhatsApp
    ? renderWhatsAppLinks(whatsappLinks, displayValue, children, locale)
    : children;

  if (ddd === null) {
    return <>{phoneNode}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {phoneNode}
      <PhoneDddBadges key={ddd} ddd={ddd} locale={locale} />
    </span>
  );
}
