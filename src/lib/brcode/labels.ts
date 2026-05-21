export type Locale = "en" | "pt";

type LocalizedText = { en: string; pt: string };

const TOP_LEVEL: Record<string, LocalizedText> = {
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

const TOP_LEVEL_DESCRIPTIONS: Record<string, LocalizedText> = {
  "00": {
    en: "EMV payload format version. PIX BR Codes use 01.",
    pt: "Versão do formato EMV do payload. BR Codes Pix usam 01.",
  },
  "01": {
    en: "Static (11) QR can be reused; dynamic (12) QR is tied to a one-time charge.",
    pt: "QR estático (11) pode ser reutilizado; dinâmico (12) é ligado a uma cobrança única.",
  },
  "02": {
    en: "Merchant account template for a non-PIX payment scheme in the 02–25 range.",
    pt: "Template de conta do comerciante para esquema de pagamento fora do Pix (faixa 02–25).",
  },
  "26": {
    en: "PIX merchant account template: GUI, key, and optional PIX-specific sub-fields.",
    pt: "Template de conta Pix: GUI, chave e subcampos opcionais específicos do Pix.",
  },
  "52": {
    en: "ISO 18245 Merchant Category Code (MCC) describing the business type.",
    pt: "Código de Categoria do Comerciante (MCC) ISO 18245 que descreve o tipo de negócio.",
  },
  "53": {
    en: "ISO 4217 numeric currency code. 986 is Brazilian Real (BRL).",
    pt: "Código numérico de moeda ISO 4217. 986 é o Real brasileiro (BRL).",
  },
  "54": {
    en: "Optional fixed transaction amount in the currency given by tag 53.",
    pt: "Valor fixo opcional da transação na moeda indicada pela tag 53.",
  },
  "58": {
    en: "ISO 3166-1 alpha-2 country code. PIX payloads use BR.",
    pt: "Código de país ISO 3166-1 alpha-2. Payloads Pix usam BR.",
  },
  "59": {
    en: "Name shown to the payer (merchant or beneficiary display name).",
    pt: "Nome exibido ao pagador (nome do recebedor ou comerciante).",
  },
  "60": {
    en: "Merchant city required by the EMV merchant presentment rules.",
    pt: "Cidade do recebedor exigida pelas regras EMV de apresentação do comerciante.",
  },
  "61": {
    en: "Postal or ZIP code of the merchant location.",
    pt: "CEP ou código postal do local do recebedor.",
  },
  "62": {
    en: "Additional data template; often carries the payment reference (txid) for dynamic QR.",
    pt: "Template de dados adicionais; frequentemente traz a referência de pagamento (txid) em QR dinâmico.",
  },
  "63": {
    en: "CRC-16/CCITT-FALSE checksum over the payload (computed excluding this field).",
    pt: "Checksum CRC-16/CCITT-FALSE sobre o payload (calculado sem este campo).",
  },
  "80": {
    en: "Composite template in the unreserved 80–99 range for issuer-specific data.",
    pt: "Template composto na faixa não reservada 80–99 para dados específicos do emissor.",
  },
};

const NESTED: Record<string, LocalizedText> = {
  "00": { en: "GUI", pt: "GUI" },
  "01": { en: "PIX Key", pt: "Chave Pix" },
  "02": { en: "Additional Info", pt: "Informação Adicional" },
  "03": { en: "Withdrawal Facilitator (fss)", pt: "Facilitador de Saque (fss)" },
  "04": { en: "Merchant Tax ID (CNPJ)", pt: "CNPJ do Comerciante" },
  "05": { en: "Reference Label (txid)", pt: "Rótulo de Referência (txid)" },
  "25": { en: "Location URL", pt: "URL da Location" },
  "50": { en: "Payment Request", pt: "Solicitação de Pagamento" },
};

const NESTED_DESCRIPTIONS: Record<string, LocalizedText> = {
  "00": {
    en: "Globally Unique Identifier. For PIX this must be br.gov.bcb.pix.",
    pt: "Identificador global único (GUI). No Pix deve ser br.gov.bcb.pix.",
  },
  "01": {
    en: "PIX key: CPF, CNPJ, email, phone, or random EVP key.",
    pt: "Chave Pix: CPF, CNPJ, e-mail, telefone ou chave aleatória (EVP).",
  },
  "02": {
    en: "Optional free-text info some wallets show alongside the payment.",
    pt: "Texto livre opcional que alguns apps exibem junto ao pagamento.",
  },
  "03": {
    en: "When set to fss under a PIX account template, marks a Pix Saque (withdrawal) QR.",
    pt: "Com valor fss no template Pix, indica QR de Pix Saque.",
  },
  "04": {
    en: "Merchant CNPJ when the PIX key is not the CNPJ itself.",
    pt: "CNPJ do recebedor quando a chave Pix não é o próprio CNPJ.",
  },
  "05": {
    en: "Reference label (txid) linking the payment to a charge or invoice.",
    pt: "Rótulo de referência (txid) que associa o pagamento a uma cobrança.",
  },
  "25": {
    en: "URL of the dynamic charge payload (cob/cobv) fetched when the QR is read.",
    pt: "URL do payload de cobrança dinâmica (cob/cobv) obtida na leitura do QR.",
  },
  "50": {
    en: "Payment arrangement or recurring-payment request identifier.",
    pt: "Identificador de arranjo de pagamento ou solicitação recorrente.",
  },
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

export function getTagDescription(
  id: string,
  parentId: string | null,
  locale: Locale,
): string {
  const nested = parentId !== null ? NESTED_DESCRIPTIONS[id] : null;
  if (nested) return nested[locale];

  const top = TOP_LEVEL_DESCRIPTIONS[id];
  if (top) return top[locale];

  const parentNum = parentId ? parseInt(parentId, 10) : NaN;
  if (parentId && parentNum >= 26 && parentNum <= 51) {
    return locale === "en"
      ? `Sub-field ${id} inside merchant account template ${parentId} (PIX or other scheme in range 26–51).`
      : `Subcampo ${id} dentro do template de conta ${parentId} (Pix ou outro esquema na faixa 26–51).`;
  }
  if (parentId === "62") {
    return locale === "en"
      ? `Sub-field ${id} inside the Additional Data Field template (tag 62).`
      : `Subcampo ${id} dentro do template de Dados Adicionais (tag 62).`;
  }
  if (parentId && parentNum >= 80 && parentNum <= 99) {
    return locale === "en"
      ? `Sub-field ${id} inside unreserved composite template ${parentId}.`
      : `Subcampo ${id} dentro do template composto não reservado ${parentId}.`;
  }

  const n = parseInt(id, 10);
  if (!Number.isNaN(n) && n >= 26 && n <= 51) {
    return locale === "en"
      ? `Merchant account template ${id}; tag 26 is reserved for PIX (br.gov.bcb.pix).`
      : `Template de conta do comerciante ${id}; a tag 26 é reservada ao Pix (br.gov.bcb.pix).`;
  }
  if (!Number.isNaN(n) && n >= 80 && n <= 99) {
    return locale === "en"
      ? `Unreserved composite template ${id} for proprietary or future extensions.`
      : `Template composto não reservado ${id} para extensões proprietárias ou futuras.`;
  }

  return locale === "en"
    ? `EMV TLV field ${id} in the BR Code payload.`
    : `Campo TLV EMV ${id} no payload BR Code.`;
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
