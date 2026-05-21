import type { Locale } from "./brcode/labels";

export const messages = {
  en: {
    title: "PIX QR Decoder",
    subtitle: "Decode BR Code payloads from QR images or Copia e Cola text.",
    language: "Language",
    upload: "Upload image",
    uploadHint: "PNG, JPEG, or WebP",
    copiaCola: "Copia e Cola",
    copiaColaHint: "Paste the EMV payload string",
    decode: "Decode",
    summary: "Summary",
    structuredData: "Structured data",
    rawPayload: "Raw payload",
    cobrancaPayload: "Cobrança payload (from location)",
    label: "Label",
    value: "Value",
    crcValid: "CRC valid",
    crcInvalid: "CRC invalid",
    crcMissing: "CRC not found",
    noQrFound: "No QR code found in the image.",
    parseError: "Parse error",
    fetchingLocation: "Fetching location…",
    fetchFailed: "Could not fetch location",
    notPix: "Not a PIX BR Code — showing raw content only.",
    dropOrClick: "Drop an image or click to browse",
    submitAnotherImage: "Submit another image with QR code",
    cropSelectArea:
      "No QR code found in the full image. Drag the square to frame the QR code, then decode.",
    cropAdjustRetry:
      "No QR code found in that area. Adjust the crop and try again.",
    decodeCrop: "Decode selection",
    decodingImage: "Reading image…",
    pickAnotherImage: "Choose another image",
    cropAgain: "Crop again",
    takePhoto: "Take photo",
    pasteImage: "Paste image",
    pasteImageHint: "Or press Ctrl+V / ⌘V with an image on the clipboard",
    invalidImageFile: "Please choose an image file (PNG, JPEG, WebP, or GIF).",
    path: "Path",
  },
  pt: {
    title: "Decodificador QR Pix",
    subtitle: "Decodifique payloads BR Code de imagens QR ou texto Copia e Cola.",
    language: "Idioma",
    upload: "Enviar imagem",
    uploadHint: "PNG, JPEG ou WebP",
    copiaCola: "Copia e Cola",
    copiaColaHint: "Cole a string EMV do payload",
    decode: "Decodificar",
    summary: "Resumo",
    structuredData: "Dados estruturados",
    rawPayload: "Payload bruto",
    cobrancaPayload: "Payload da cobrança (location)",
    label: "Rótulo",
    value: "Valor",
    crcValid: "CRC válido",
    crcInvalid: "CRC inválido",
    crcMissing: "CRC não encontrado",
    noQrFound: "Nenhum QR Code encontrado na imagem.",
    parseError: "Erro de parse",
    fetchingLocation: "Buscando location…",
    fetchFailed: "Não foi possível buscar a location",
    notPix: "Não é BR Code Pix — exibindo apenas o conteúdo bruto.",
    dropOrClick: "Solte uma imagem ou clique para selecionar",
    submitAnotherImage: "Enviar outra imagem com QR code",
    cropSelectArea:
      "Nenhum QR Code na imagem inteira. Ajuste o quadrado sobre o QR Code e decodifique.",
    cropAdjustRetry:
      "Nenhum QR Code nessa área. Ajuste o recorte e tente novamente.",
    decodeCrop: "Decodificar seleção",
    decodingImage: "Lendo imagem…",
    pickAnotherImage: "Escolher outra imagem",
    cropAgain: "Recortar novamente",
    takePhoto: "Tirar foto",
    pasteImage: "Colar imagem",
    pasteImageHint:
      "Ou pressione Ctrl+V / ⌘V com uma imagem na área de transferência",
    invalidImageFile:
      "Selecione um arquivo de imagem (PNG, JPEG, WebP ou GIF).",
    path: "Caminho",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type MessageKey = keyof (typeof messages)["en"];

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
