import { Badge } from "@/components/ui/badge";
import type { PixKeyKind } from "@/lib/dehashed/classify-pix-key";
import { t, type MessageKey } from "@/lib/i18n";
import type { Locale } from "@/lib/brcode/labels";

const KIND_MESSAGE_KEY: Record<PixKeyKind, MessageKey> = {
  email: "pixKeyTypeEmail",
  phone: "pixKeyTypePhone",
  cpf: "pixKeyTypeCpf",
  cnpj: "pixKeyTypeCnpj",
  evp: "pixKeyTypeEvp",
  unsupported: "pixKeyTypeUnknown",
};

type PixKeyTypeBadgeProps = {
  kind: PixKeyKind;
  locale: Locale;
};

export function PixKeyTypeBadge({ kind, locale }: PixKeyTypeBadgeProps) {
  return (
    <Badge variant="secondary" className="font-sans">
      {t(locale, KIND_MESSAGE_KEY[kind])}
    </Badge>
  );
}
