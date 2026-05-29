"use client";

import type { ReactNode } from "react";
import { IpLocationBadge } from "@/components/ip-location-badge";
import { parseIpAddressesFromValue } from "@/lib/ip/parse-ip";
import type { Locale } from "@/lib/brcode/labels";

type IpEnrichedValueProps = {
  rawValue: string;
  locale: Locale;
  active: boolean;
  children: ReactNode;
};

/** Wraps an IP field with geolocation badges when `active` and values are valid IPs. */
export function IpEnrichedValue({
  rawValue,
  locale,
  active,
  children,
}: IpEnrichedValueProps) {
  const ips = active ? parseIpAddressesFromValue(rawValue) : [];

  if (ips.length === 0) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      {ips.map((ip) => (
        <IpLocationBadge key={ip} ip={ip} locale={locale} />
      ))}
    </span>
  );
}
