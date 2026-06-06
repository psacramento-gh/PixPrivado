"use client";

import { Fragment, type ReactNode } from "react";
import { LookupPhoneLink } from "@/components/lookup/lookup-phone-link";
import { PhoneDddBadges } from "@/components/phone-ddd-badges";
import { extractDddFromPhone } from "@/lib/br/extract-ddd";
import { getPhoneLinksFromValue } from "@/lib/br/phone-link";
import type { Locale } from "@/lib/brcode/labels";
import { classifyPixKey } from "@/lib/dehashed/classify-pix-key";
import { parseIpAddress } from "@/lib/ip/parse-ip";

type PhoneEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  /** Visible label for the phone link; defaults to rawValue or children when string. */
  displayValue?: string;
  /** When false, never attach DDD badges (e.g. ip_address rows). Default true. */
  active?: boolean;
  children: ReactNode;
};

function renderPhoneLinks(
  links: ReturnType<typeof getPhoneLinksFromValue>,
  displayValue: string | undefined,
  children: ReactNode,
  locale: Locale,
) {
  if (links.length === 1) {
    const link = links[0]!;
    const label =
      displayValue ?? (typeof children === "string" ? children : link.display);
    return (
      <LookupPhoneLink
        displayValue={label}
        href={link.url}
        kind={link.kind}
        locale={locale}
      />
    );
  }

  return links.map((link, index) => (
    <Fragment key={link.e164}>
      {index > 0 ? <span>, </span> : null}
      <LookupPhoneLink
        displayValue={link.display}
        href={link.url}
        kind={link.kind}
        locale={locale}
      />
    </Fragment>
  ));
}

/** Wraps a phone value with phone links and DDD state badges when applicable. */
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
  const phoneLinks =
    kind === "cpf" || kind === "cnpj" ? [] : getPhoneLinksFromValue(rawValue);
  const ddd = kind === "phone" ? extractDddFromPhone(rawValue) : null;

  const canReplaceWithPhoneLink =
    phoneLinks.length > 0 &&
    (displayValue !== undefined || typeof children === "string");

  if (!canReplaceWithPhoneLink && phoneLinks.length === 0 && ddd === null) {
    return <>{children}</>;
  }

  const phoneNode = canReplaceWithPhoneLink
    ? renderPhoneLinks(phoneLinks, displayValue, children, locale)
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
