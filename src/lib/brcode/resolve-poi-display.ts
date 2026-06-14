import type { Locale } from "@/lib/brcode/labels";

export type PoiMethodKind = "static" | "dynamic";

export type PoiDisplay = {
  kind: PoiMethodKind;
  label: string;
  ariaLabel: string;
};

export function resolvePoiDisplay(
  value: string,
  locale: Locale,
): PoiDisplay | null {
  if (value === "11") {
    return {
      kind: "static",
      label: locale === "en" ? "static" : "estático",
      ariaLabel:
        locale === "en"
          ? "Point of initiation method: static (11)"
          : "Método de iniciação do ponto: estático (11)",
    };
  }

  if (value === "12") {
    return {
      kind: "dynamic",
      label: locale === "en" ? "dynamic" : "dinâmico",
      ariaLabel:
        locale === "en"
          ? "Point of initiation method: dynamic (12)"
          : "Método de iniciação do ponto: dinâmico (12)",
    };
  }

  return null;
}

export function isPointOfInitiationRow(row: {
  id: string;
  parentId: string | null;
}): boolean {
  return row.id === "01" && row.parentId === null;
}
