import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/brcode/labels";
import { resolvePoiDisplay } from "@/lib/brcode/resolve-poi-display";

type PoiMethodBadgeProps = {
  value: string;
  locale: Locale;
};

export function PoiMethodBadge({ value, locale }: PoiMethodBadgeProps) {
  const display = resolvePoiDisplay(value, locale);

  if (!display) return null;

  return (
    <Badge variant="secondary" className="font-sans" aria-label={display.ariaLabel}>
      {display.label}
    </Badge>
  );
}
