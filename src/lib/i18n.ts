import type { Locale } from "./brcode/labels";

export const messages = {
  en: {
    title: "PIX QR Decoder",
    titleHomeAria: "PIX QR Decoder — start a new submission",
    subtitle: "Decode BR Code payloads from QR images or Copia e Cola text.",
    language: "Language",
    upload: "Upload image",
    uploadHint: "PNG, JPEG, or WebP",
    copiaCola: "Copia e Cola",
    copiaColaHint: "Paste the EMV payload string",
    decode: "Decode",
    structuredView: "Structured view",
    rawPayload: "Raw payload",
    cobrancaPayload: "Cobrança payload (from location)",
    label: "Label",
    value: "Value",
    noQrFound: "No QR code found in the image.",
    parseError: "Parse error",
    fetchingLocation: "Fetching location…",
    fetchFailed: "Could not fetch location",
    notPix: "Not a PIX BR Code — showing raw content only.",
    dropOrClick: "Drop an image or click to browse",
    submitAnotherImage: "Make new submission",
    decodedFromImage: "QR region in uploaded image",
    decodingImage: "Reading image…",
    takePhoto: "Take photo",
    pasteImage: "Paste image",
    pasteImageHint: "Or press Ctrl+V / ⌘V with an image on the clipboard",
    invalidImageFile: "Please choose an image file (PNG, JPEG, WebP, or GIF).",
    path: "Path",
    backToDecoder: "Back to PIX decoder",
    dehashedSubtitle: "Breach data lookup for a value from your decoded PIX payload.",
    dehashedMissingQuery: "Missing search query.",
    dehashedResults: "Dehashed results",
    dehashedNoEntries: "No entries returned.",
    dehashedShowing: "Showing {shown} of {total} result(s).",
    dehashedBalance: "API balance: {balance}.",
    dehashedEntry: "Entry {index}",
    dehashedPage: "Page {page} of {pages}",
    dehashedPrevious: "Previous",
    dehashedNext: "Next",
    dehashedPagination: "Results pagination",
    dehashedPreviewHint:
      "Branch URLs like …git-…vercel.app are Preview — the variable must be enabled for Preview, not Production only.",
    dehashedEnvHint:
      "Vercel → Project → Settings → Environment Variables → DEHASHED_API_KEY → check Preview and Production → Save → Redeploy.",
    pixKeyTypeEmail: "Email",
    pixKeyTypePhone: "Phone",
    pixKeyTypeCpf: "CPF",
    pixKeyTypeCnpj: "CNPJ",
    pixKeyTypeEvp: "EVP",
    pixKeyTypeUnknown: "Unknown",
  },
  pt: {
    title: "Decodificador QR Pix",
    titleHomeAria: "Decodificador QR Pix — iniciar nova decodificação",
    subtitle: "Decodifique payloads BR Code de imagens QR ou texto Copia e Cola.",
    language: "Idioma",
    upload: "Enviar imagem",
    uploadHint: "PNG, JPEG ou WebP",
    copiaCola: "Copia e Cola",
    copiaColaHint: "Cole a string EMV do payload",
    decode: "Decodificar",
    structuredView: "Visualização estruturada",
    rawPayload: "Payload bruto",
    cobrancaPayload: "Payload da cobrança (location)",
    label: "Rótulo",
    value: "Valor",
    noQrFound: "Nenhum QR Code encontrado na imagem.",
    parseError: "Erro de parse",
    fetchingLocation: "Buscando location…",
    fetchFailed: "Não foi possível buscar a location",
    notPix: "Não é BR Code Pix — exibindo apenas o conteúdo bruto.",
    dropOrClick: "Solte uma imagem ou clique para selecionar",
    submitAnotherImage: "Nova submissão",
    decodedFromImage: "Região do QR na imagem enviada",
    decodingImage: "Lendo imagem…",
    takePhoto: "Tirar foto",
    pasteImage: "Colar imagem",
    pasteImageHint:
      "Ou pressione Ctrl+V / ⌘V com uma imagem na área de transferência",
    invalidImageFile:
      "Selecione um arquivo de imagem (PNG, JPEG, WebP ou GIF).",
    path: "Caminho",
    backToDecoder: "Voltar ao decodificador PIX",
    dehashedSubtitle:
      "Consulta de vazamentos para um valor do payload PIX decodificado.",
    dehashedMissingQuery: "Consulta de busca ausente.",
    dehashedResults: "Resultados Dehashed",
    dehashedNoEntries: "Nenhuma entrada retornada.",
    dehashedShowing: "Exibindo {shown} de {total} resultado(s).",
    dehashedBalance: "Saldo da API: {balance}.",
    dehashedEntry: "Entrada {index}",
    dehashedPage: "Página {page} de {pages}",
    dehashedPrevious: "Anterior",
    dehashedNext: "Próxima",
    dehashedPagination: "Paginação dos resultados",
    dehashedPreviewHint:
      "URLs de branch como …git-…vercel.app são Preview — a variável precisa estar habilitada em Preview, não só em Production.",
    dehashedEnvHint:
      "Vercel → Projeto → Settings → Environment Variables → DEHASHED_API_KEY → marque Preview e Production → Salvar → Redeploy.",
    pixKeyTypeEmail: "E-mail",
    pixKeyTypePhone: "Telefone",
    pixKeyTypeCpf: "CPF",
    pixKeyTypeCnpj: "CNPJ",
    pixKeyTypeEvp: "EVP",
    pixKeyTypeUnknown: "Desconhecido",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type MessageKey = keyof (typeof messages)["en"];

export function t(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  let text: string = messages[locale][key];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
