/** Brazilian CNPJ: 99.999.999/9999-99 */
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value.trim();
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/** Brazilian CPF: 999.999.999-99 */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value.trim();
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

const TRAILING_CPF_RAW = /^(.+?)\s+(\d{11})$/;
const TRAILING_CPF_FORMATTED =
  /^(.+?)\s+(\d{3}\.\d{3}\.\d{3}-\d{2})$/;

/**
 * Receita often appends the owner's CPF to razão social (e.g. "NAME SURNAME 12345678901").
 */
export function extractTrailingCpfFromText(value: string): {
  namePart: string;
  cpfDigits: string;
  cpfFormatted: string;
} | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const formattedMatch = trimmed.match(TRAILING_CPF_FORMATTED);
  if (formattedMatch) {
    const cpfDigits = formattedMatch[2].replace(/\D/g, "");
    if (cpfDigits.length === 11) {
      return {
        namePart: formattedMatch[1].trimEnd(),
        cpfDigits,
        cpfFormatted: formatCpf(cpfDigits),
      };
    }
  }

  const rawMatch = trimmed.match(TRAILING_CPF_RAW);
  if (rawMatch) {
    const cpfDigits = rawMatch[2];
    return {
      namePart: rawMatch[1].trimEnd(),
      cpfDigits,
      cpfFormatted: formatCpf(cpfDigits),
    };
  }

  return null;
}

export function isReceitaCnpjField(fieldPath: string): boolean {
  return fieldPath === "cnpj" || fieldPath.endsWith(".cnpj");
}

export function isReceitaRazaoSocialField(fieldPath: string): boolean {
  return fieldPath === "razao_social" || fieldPath.endsWith(".razao_social");
}

export function isReceitaNomeSocioField(fieldPath: string): boolean {
  return fieldPath === "nome_socio" || fieldPath.endsWith(".nome_socio");
}

/** Person or company names that should link to a Dehashed name search. */
export function isReceitaDehashedNameField(fieldPath: string): boolean {
  return isReceitaRazaoSocialField(fieldPath) || isReceitaNomeSocioField(fieldPath);
}
