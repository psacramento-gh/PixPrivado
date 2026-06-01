import { isValidCpf } from "@/lib/br/cpf-candidates";
import { normalizeCpfDigits } from "@/lib/cpfhub/is-cpf-query";
import { CPFHUB_API_ORIGIN, CPFHUB_LOOKUP_TIMEOUT_MS } from "./constants";
import { parseRemainingCredits } from "./parse-quota";
import type { CpfHubGender, CpfHubLookupResult, CpfHubPerson } from "./types";

export { isCpfSearchQuery, normalizeCpfDigits } from "./is-cpf-query";

type CpfHubErrorBody = {
  success?: boolean;
  error?:
    | string
    | {
        code?: string;
        message?: string;
      };
};

function parsePerson(data: unknown, cpf: string): CpfHubPerson | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : "";
  const nameUpper = typeof record.nameUpper === "string" ? record.nameUpper : "";
  const gender = record.gender === "M" || record.gender === "F" ? record.gender : null;
  const birthDate = typeof record.birthDate === "string" ? record.birthDate : "";
  const day = typeof record.day === "number" ? record.day : null;
  const month = typeof record.month === "number" ? record.month : null;
  const year = typeof record.year === "number" ? record.year : null;
  if (!name || !gender || !birthDate || day === null || month === null || year === null) {
    return null;
  }

  return {
    cpf: typeof record.cpf === "string" ? record.cpf : cpf,
    name,
    nameUpper,
    gender,
    birthDate,
    day,
    month,
    year,
  };
}

function errorMessageFromBody(body: CpfHubErrorBody, status: number): { message: string; code?: string } {
  const err = body.error;
  if (typeof err === "string" && err.trim()) {
    return { message: err.trim() };
  }
  if (err && typeof err === "object") {
    const code = typeof err.code === "string" ? err.code : undefined;
    const message =
      typeof err.message === "string" && err.message.trim()
        ? err.message.trim()
        : code ?? `CPFHub API returned ${status}`;
    return { message, code };
  }
  return { message: `CPFHub API returned ${status}` };
}

function mapErrorToUserMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case "CPF_NOT_FOUND":
      return "CPF_NOT_FOUND";
    case "INVALID_CPF_DIGITS":
      return "This CPF has invalid check digits.";
    case "INVALID_CPF_FORMAT":
      return "This CPF format is not valid.";
    case "RATE_LIMIT_EXCEEDED":
      return "CPFHub rate limit exceeded. Wait a moment and try again.";
    case "UNAUTHORIZED":
      return "CPFHub API key is missing or invalid.";
    default:
      return fallback;
  }
}

export async function fetchCpfHub(cpfInput: string): Promise<CpfHubLookupResult> {
  const cpf = normalizeCpfDigits(cpfInput);
  if (cpf.length !== 11) {
    return { ok: false, cpf, error: "CPF must have 11 digits.", status: 400 };
  }

  if (!isValidCpf(cpf)) {
    return {
      ok: false,
      cpf,
      error: "This CPF has invalid check digits.",
      status: 422,
      code: "INVALID_CPF_DIGITS",
    };
  }

  const apiKey = process.env.CPFHUB_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      cpf,
      error:
        "CPFHUB_API_KEY is not available in this deployment. On Vercel, add it for Preview and Production, then redeploy.",
      status: 503,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CPFHUB_LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(`${CPFHUB_API_ORIGIN}/cpf/${cpf}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    const remainingCredits = parseRemainingCredits(response.headers, body);

    if (!response.ok) {
      const parsed =
        body && typeof body === "object"
          ? errorMessageFromBody(body as CpfHubErrorBody, response.status)
          : { message: `CPFHub API returned ${response.status}` };
      const code = parsed.code;
      return {
        ok: false,
        cpf,
        error: mapErrorToUserMessage(code, parsed.message),
        status: response.status,
        code,
      };
    }

    const envelope =
      body && typeof body === "object" ? (body as { success?: boolean; data?: unknown }) : null;
    const person = parsePerson(envelope?.data, cpf);
    if (!person) {
      return {
        ok: false,
        cpf,
        error: "CPFHub returned an unexpected response.",
        status: 502,
      };
    }

    return { ok: true, cpf, data: person, remainingCredits };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, cpf, error: "CPFHub request timed out.", status: 504 };
    }
    return { ok: false, cpf, error: "Could not reach the CPFHub API.", status: 502 };
  } finally {
    clearTimeout(timeout);
  }
}

export function cpfHubGenderLabel(gender: CpfHubGender, locale: "en" | "pt"): string {
  if (gender === "M") return locale === "pt" ? "Masculino" : "Male";
  return locale === "pt" ? "Feminino" : "Female";
}
