import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMerchantNameIdentifierPortalUrl,
  buildPessoaFisicaPortalUrlFromCpfDigits,
  buildPessoaFisicaPortalUrlFromName,
  buildPessoaJuridicaPortalUrlFromCnpjDigits,
  buildPessoaJuridicaPortalUrlFromName,
  isValidCpfForPortalLookup,
  termoFromDehashedQuery,
} from "./portal-link";
import { buildPessoaFisicaSearchUrl, buildPessoaJuridicaSearchUrl } from "./search-url";

test("buildPessoaFisicaSearchUrl", () => {
  const url = buildPessoaFisicaSearchUrl("Joao Silva");
  assert.equal(
    url,
    "https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista?termo=Joao+Silva&pagina=1&tamanhoPagina=10",
  );
});

test("buildPessoaJuridicaSearchUrl", () => {
  const url = buildPessoaJuridicaSearchUrl("empresa nova");
  assert.equal(
    url,
    "https://portaldatransparencia.gov.br/pessoa-juridica/busca/lista?termo=empresa+nova&pagina=1&tamanhoPagina=10",
  );
});

test("buildPessoaFisicaPortalUrlFromCpfDigits", () => {
  const url = buildPessoaFisicaPortalUrlFromCpfDigits("02563732131");
  assert.ok(url?.includes("termo=025.637.321-31"));
});

test("buildPessoaFisicaPortalUrlFromCpfDigits rejects invalid check digits", () => {
  assert.equal(buildPessoaFisicaPortalUrlFromCpfDigits("11111111111"), null);
  assert.equal(isValidCpfForPortalLookup("11111111111"), false);
});

test("termoFromDehashedQuery", () => {
  assert.equal(termoFromDehashedQuery("email:a@b.co", ""), "a@b.co");
  assert.equal(termoFromDehashedQuery("02563732131", ""), "025.637.321-31");
  assert.equal(termoFromDehashedQuery('name:"Joao Silva"', ""), "Joao Silva");
});

test("buildPessoaJuridicaPortalUrlFromName rejects empty", () => {
  assert.equal(buildPessoaJuridicaPortalUrlFromName("   "), null);
});

test("buildPessoaFisicaPortalUrlFromName", () => {
  assert.ok(buildPessoaFisicaPortalUrlFromName("Joao Silva"));
});

test("buildPessoaJuridicaPortalUrlFromCnpjDigits", () => {
  const url = buildPessoaJuridicaPortalUrlFromCnpjDigits("30407634000124");
  assert.equal(
    url,
    "https://portaldatransparencia.gov.br/pessoa-juridica/busca/lista?termo=30.407.634%2F0001-24&pagina=1&tamanhoPagina=10",
  );
});

test("buildMerchantNameIdentifierPortalUrl CNPJ uses juridica", () => {
  const url = buildMerchantNameIdentifierPortalUrl(
    "12345678000195",
    "12.345.678/0001-95",
  );
  assert.ok(url?.includes("/pessoa-juridica/"));
});

test("buildMerchantNameIdentifierPortalUrl skips plain names", () => {
  assert.equal(
    buildMerchantNameIdentifierPortalUrl("Joao Silva", "Joao Silva"),
    null,
  );
});
