export type Locale = "en" | "pt";

const TOP_LEVEL: Record<string, { en: string; pt: string }> = {
  "00": { en: "Payload Format Indicator", pt: "Indicador de Formato do Payload" },
  "01": { en: "Point of Initiation Method", pt: "Método de Iniciação do Ponto" },
  "02": { en: "Merchant Account Information", pt: "Informação da Conta do Comerciante" },
  "26": { en: "Merchant Account Information (PIX)", pt: "Informação da Conta do Comerciante (PIX)" },
  "52": { en: "Merchant Category Code", pt: "Código de Categoria do Comerciante" },
  "53": { en: "Transaction Currency", pt: "Moeda da Transação" },
  "54": { en: "Transaction Amount", pt: "Valor da Transação" },
  "58": { en: "Country Code", pt: "Código do País" },
  "59": { en: "Merchant Name", pt: "Nome do Recebedor" },
  "60": { en: "Merchant City", pt: "Cidade do Recebedor" },
  "61": { en: "Postal Code", pt: "Código Postal" },
  "62": { en: "Additional Data Field", pt: "Campo de Dados Adicionais" },
  "63": { en: "CRC16", pt: "CRC16" },
  "80": { en: "Unreserved Templates (Composite)", pt: "Templates Não Reservados (Composto)" },
};

const NESTED: Record<string, { en: string; pt: string }> = {
  "00": { en: "GUI", pt: "GUI" },
  "01": { en: "PIX Key", pt: "Chave Pix" },
  "02": { en: "Additional Info", pt: "Informação Adicional" },
  "03": { en: "Withdrawal Facilitator (fss)", pt: "Facilitador de Saque (fss)" },
  "04": { en: "Merchant Tax ID (CNPJ)", pt: "CNPJ do Comerciante" },
  "05": { en: "Reference Label (txid)", pt: "Rótulo de Referência (txid)" },
  "25": { en: "Location URL", pt: "URL da Location" },
  "50": { en: "Payment Request", pt: "Solicitação de Pagamento" },
};

export function getTagLabel(
  id: string,
  parentId: string | null,
  locale: Locale,
): string {
  const nested = parentId !== null ? NESTED[id] : null;
  if (nested) return nested[locale];

  const top = TOP_LEVEL[id];
  if (top) return top[locale];

  const parentNum = parentId ? parseInt(parentId, 10) : NaN;
  if (parentId && parentNum >= 26 && parentNum <= 51) {
    return locale === "en"
      ? `Merchant Account sub-field ${id}`
      : `Subcampo da conta ${id}`;
  }
  if (parentId === "62") {
    return locale === "en"
      ? `Additional Data sub-field ${id}`
      : `Subcampo adicional ${id}`;
  }
  if (parentId && parentNum >= 80 && parentNum <= 99) {
    return locale === "en"
      ? `Unreserved sub-field ${id}`
      : `Subcampo não reservado ${id}`;
  }

  const n = parseInt(id, 10);
  if (!Number.isNaN(n) && n >= 26 && n <= 51) {
    return locale === "en"
      ? `Merchant Account Information (${id})`
      : `Informação da Conta do Comerciante (${id})`;
  }
  if (!Number.isNaN(n) && n >= 80 && n <= 99) {
    return locale === "en"
      ? `Unreserved Template (${id})`
      : `Template Não Reservado (${id})`;
  }

  return locale === "en" ? `Field ${id}` : `Campo ${id}`;
}

export function formatDisplayValue(
  id: string,
  value: string,
  parentId: string | null,
  locale: Locale,
): string {
  if (id === "53" && value === "986") {
    return locale === "en" ? "986 (BRL)" : "986 (R$)";
  }
  if (id === "01" && parentId === null) {
    if (value === "11") return locale === "en" ? "11 (static)" : "11 (estático)";
    if (value === "12") return locale === "en" ? "12 (dynamic)" : "12 (dinâmico)";
  }
  if (id === "63" && parentId === null && value.length === 4) {
    return `0x${value.toUpperCase()}`;
  }
  if (id === "03" && parentId && parseInt(parentId, 10) >= 26) {
    return `${value} (${locale === "en" ? "Pix Withdrawal" : "Pix Saque"})`;
  }
  return value;
}
