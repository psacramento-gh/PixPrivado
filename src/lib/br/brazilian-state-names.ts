import type { Locale } from "@/lib/brcode/labels";

const STATE_NAMES: Record<string, { en: string; pt: string }> = {
  AC: { en: "Acre", pt: "Acre" },
  AL: { en: "Alagoas", pt: "Alagoas" },
  AM: { en: "Amazonas", pt: "Amazonas" },
  AP: { en: "Amapá", pt: "Amapá" },
  BA: { en: "Bahia", pt: "Bahia" },
  CE: { en: "Ceará", pt: "Ceará" },
  DF: { en: "Federal District", pt: "Distrito Federal" },
  ES: { en: "Espírito Santo", pt: "Espírito Santo" },
  GO: { en: "Goiás", pt: "Goiás" },
  MA: { en: "Maranhão", pt: "Maranhão" },
  MG: { en: "Minas Gerais", pt: "Minas Gerais" },
  MS: { en: "Mato Grosso do Sul", pt: "Mato Grosso do Sul" },
  MT: { en: "Mato Grosso", pt: "Mato Grosso" },
  PA: { en: "Pará", pt: "Pará" },
  PB: { en: "Paraíba", pt: "Paraíba" },
  PE: { en: "Pernambuco", pt: "Pernambuco" },
  PI: { en: "Piauí", pt: "Piauí" },
  PR: { en: "Paraná", pt: "Paraná" },
  RJ: { en: "Rio de Janeiro", pt: "Rio de Janeiro" },
  RN: { en: "Rio Grande do Norte", pt: "Rio Grande do Norte" },
  RO: { en: "Rondônia", pt: "Rondônia" },
  RR: { en: "Roraima", pt: "Roraima" },
  RS: { en: "Rio Grande do Sul", pt: "Rio Grande do Sul" },
  SC: { en: "Santa Catarina", pt: "Santa Catarina" },
  SE: { en: "Sergipe", pt: "Sergipe" },
  SP: { en: "São Paulo", pt: "São Paulo" },
  TO: { en: "Tocantins", pt: "Tocantins" },
};

export function getBrazilianStateDisplayName(uf: string, locale: Locale): string {
  const key = uf.trim().toUpperCase();
  const entry = STATE_NAMES[key];
  if (!entry) return uf;
  return locale === "pt" ? entry.pt : entry.en;
}
