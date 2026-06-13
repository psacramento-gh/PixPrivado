import { isValidCpf } from "@/lib/br/cpf-candidates";
import { formatCnpj, formatCpf } from "@/lib/br/format-document";
import {
  buildMerchantNameQuery,
  isAllowedMerchantLookupQuery,
  isMerchantNameIdentifier,
} from "@/lib/lookup/merchant-query";
import {
  buildCnpjPortalGateQuery,
  buildNamePortalGateQuery,
} from "@/lib/receita/breach-link";
import {
  buildPessoaFisicaSearchUrl,
  buildPessoaJuridicaSearchUrl,
} from "./search-url";

/** Maps a validated lookup query to the portal `termo` search text. */
export function termoFromLookupQuery(
  query: string,
  displayFallback: string,
): string {
  if (query.startsWith("email:")) {
    return query.slice("email:".length).trim();
  }
  if (query.startsWith("phone:")) {
    return displayFallback.trim() || query.slice("phone:".length).trim();
  }
  if (/^\d{11}$/.test(query)) {
    return formatCpf(query);
  }
  if (/^\d{14}$/.test(query)) {
    return formatCnpj(query);
  }
  const quotedName = /^name:"((?:[^"\\]|\\.)*)"$/.exec(query);
  if (quotedName) {
    return quotedName[1].replace(/\\"/g, '"');
  }
  if (query.startsWith("name:")) {
    return query.slice("name:".length);
  }
  const quotedAll = /^"((?:[^"\\]|\\.)*)"$/.exec(query);
  if (quotedAll) {
    return quotedAll[1].replace(/\\"/g, '"');
  }
  if (/^[^\s"\\]{2,200}$/.test(query)) {
    return query;
  }
  return displayFallback.trim();
}

export function buildPessoaFisicaPortalUrlFromName(name: string): string | null {
  if (!buildNamePortalGateQuery(name)) return null;
  return buildPessoaFisicaSearchUrl(name.trim());
}

export function isValidCpfForPortalLookup(cpfDigits: string): boolean {
  const digits = cpfDigits.replace(/\D/g, "");
  return digits.length === 11 && isValidCpf(digits);
}

export function buildPessoaFisicaPortalUrlFromCpfDigits(cpfDigits: string): string | null {
  const digits = cpfDigits.replace(/\D/g, "");
  if (!isValidCpfForPortalLookup(digits)) return null;
  return buildPessoaFisicaSearchUrl(formatCpf(digits));
}

export function buildPessoaJuridicaPortalUrlFromName(name: string): string | null {
  if (!buildNamePortalGateQuery(name)) return null;
  return buildPessoaJuridicaSearchUrl(name.trim());
}

export function buildPessoaJuridicaPortalUrlFromCnpjDigits(
  cnpjDigits: string,
): string | null {
  if (!buildCnpjPortalGateQuery(cnpjDigits)) return null;
  return buildPessoaJuridicaSearchUrl(
    formatCnpj(cnpjDigits.replace(/\D/g, "")),
  );
}

/** EMV tag 59 identifiers (CPF/CNPJ/email/phone) — Portal da Transparência lookup. */
export function buildMerchantNameIdentifierPortalUrl(
  rawValue: string,
  displayValue: string,
): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed || !isMerchantNameIdentifier(trimmed)) return null;

  const query = buildMerchantNameQuery(rawValue);
  if (!query || !isAllowedMerchantLookupQuery(query)) return null;

  const termo = termoFromLookupQuery(query, displayValue);
  if (!termo) return null;

  if (/^\d{14}$/.test(query)) {
    return buildPessoaJuridicaSearchUrl(termo);
  }

  return buildPessoaFisicaSearchUrl(termo);
}
