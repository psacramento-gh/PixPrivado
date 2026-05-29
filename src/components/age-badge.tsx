import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

type AgeBadgeProps = {
  age: number;
  locale: Locale;
};

export function AgeBadge({ age, locale }: AgeBadgeProps) {
  return (
    <Badge
      variant="default"
      className="font-sans bg-amber-600 text-white hover:bg-amber-600/90 dark:bg-amber-500 dark:hover:bg-amber-500/90"
    >
      {t(locale, "ageYearsOld", { age: String(age) })}
    </Badge>
  );
}
