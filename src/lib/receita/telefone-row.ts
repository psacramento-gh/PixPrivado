const TELEFONE_VALUE_SEP = "\u001f";

export function encodeReceitaTelefoneValue(ddd: string, numero: string): string {
  return `${ddd}${TELEFONE_VALUE_SEP}${numero}`;
}

export function decodeReceitaTelefoneValue(value: string): { ddd: string; numero: string } {
  const sep = value.indexOf(TELEFONE_VALUE_SEP);
  if (sep === -1) {
    return { ddd: value, numero: "" };
  }
  return {
    ddd: value.slice(0, sep),
    numero: value.slice(sep + TELEFONE_VALUE_SEP.length),
  };
}

/** Merged OpenCNPJ phone row (`telefones[n]`), not address `numero`. */
export function isReceitaTelefoneRowField(fieldPath: string): boolean {
  return /^telefones\[\d+\]$/.test(fieldPath);
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * National number for Dehashed (`+55` + DDD + local) when both parts are present and valid.
 */
export function buildReceitaTelefoneBreachRaw(ddd: string, numero: string): string | null {
  const dddDigits = digitsOnly(ddd);
  const numDigits = digitsOnly(numero);
  if (dddDigits.length !== 2 || numDigits.length < 8 || numDigits.length > 9) {
    return null;
  }
  return `+55${dddDigits}${numDigits}`;
}

/**
 * Brazilian display: (11) 98765-4321 (mobile) or (11) 3456-7890 (landline).
 * Returns null when parts are incomplete or lengths are unexpected.
 */
export function formatReceitaTelefoneDisplay(ddd: string, numero: string): string | null {
  const dddDigits = digitsOnly(ddd);
  const numDigits = digitsOnly(numero);
  if (dddDigits.length !== 2 || !numDigits) return null;

  if (numDigits.length === 9) {
    return `(${dddDigits}) ${numDigits.slice(0, 5)}-${numDigits.slice(5)}`;
  }
  if (numDigits.length === 8) {
    return `(${dddDigits}) ${numDigits.slice(0, 4)}-${numDigits.slice(4)}`;
  }
  return null;
}

/** Partial telefone rows: show raw DDD and/or número without formatting. */
export function formatReceitaTelefonePartialDisplay(ddd: string, numero: string): string {
  const parts = [ddd.trim(), numero.trim()].filter(Boolean);
  return parts.join(" ");
}
