import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type AgeBadgeProps = {
  age: number;
  locale: Locale;
};

export function AgeBadge({ age, locale }: AgeBadgeProps) {
  return (
    <Badge variant="secondary" className="font-sans">
      {t(locale, "ageYearsOld", { age: String(age) })}
    </Badge>
  );
}
