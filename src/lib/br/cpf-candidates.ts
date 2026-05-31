/** Eleven slots: known digit or `*` (one unknown digit). */
export type CpfSocioSlots = string[];

/**
 * Parses Receita `cnpj_cpf_socio` values that are 11 CPF digits or masks (`***972696**`).
 * Returns null for CNPJ-length values and other shapes.
 */
export function parseCpfSocioSlots(value: string): CpfSocioSlots | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^[\d*]{11}$/.test(trimmed)) {
    return [...trimmed];
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && /^\d{11}$/.test(digits)) {
    return [...digits];
  }

  return null;
}

export function isReceitaCnpjCpfSocioField(fieldPath: string): boolean {
  return fieldPath === "cnpj_cpf_socio" || fieldPath.endsWith(".cnpj_cpf_socio");
}

/** True when the value is an 11-slot CPF (not a 14-digit CNPJ). */
export function isReceitaCpfSocioShape(value: string): boolean {
  return parseCpfSocioSlots(value) !== null;
}

export function isKnownInvalidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return true;
  return /^(\d)\1{10}$/.test(digits);
}

/** Mod-11 check digits for the first nine CPF base digits. */
export function computeCpfCheckDigits(base9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(base9[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const first = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  const ten = base9 + String(first);
  for (let i = 0; i < 10; i++) {
    sum += Number(ten[i]) * (11 - i);
  }
  remainder = sum % 11;
  const second = remainder < 2 ? 0 : 11 - remainder;

  return String(first) + String(second);
}

export function isValidCpf(digits: string): boolean {
  if (digits.length !== 11 || !/^\d{11}$/.test(digits)) return false;
  if (isKnownInvalidCpf(digits)) return false;
  return digits.slice(9) === computeCpfCheckDigits(digits.slice(0, 9));
}

/**
 * All valid CPF numbers matching the mask or full value, as 11-digit strings,
 * sorted ascending.
 */
export function enumerateCpfCandidates(value: string): string[] {
  const parsed = parseCpfSocioSlots(value);
  if (!parsed) return [];

  const mask = parsed;
  const results: string[] = [];

  function matchesMask(full: string): boolean {
    for (let i = 0; i < 11; i++) {
      if (mask[i] !== "*" && mask[i] !== full[i]) return false;
    }
    return true;
  }

  function tryBaseNine(base9: string): void {
    const full = base9 + computeCpfCheckDigits(base9);
    if (!matchesMask(full)) return;
    if (!isValidCpf(full)) return;
    results.push(full);
  }

  function recurseBase(pos: number, chars: string[]): void {
    if (pos === 9) {
      tryBaseNine(chars.join(""));
      return;
    }

    if (mask[pos] === "*") {
      for (let digit = 0; digit <= 9; digit++) {
        chars[pos] = String(digit);
        recurseBase(pos + 1, chars);
      }
      return;
    }

    chars[pos] = mask[pos];
    recurseBase(pos + 1, chars);
  }

  recurseBase(0, new Array(9));

  return [...new Set(results)].sort();
}

export function formatCpfCandidateList(candidates: string[]): string[] {
  return candidates.map((digits) => {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  });
}
