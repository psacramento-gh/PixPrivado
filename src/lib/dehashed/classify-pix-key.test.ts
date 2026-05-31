import assert from "node:assert/strict";
import test from "node:test";
import { parseIpAddress } from "../ip/parse-ip.ts";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function looksLikeIpNotation(value: string): boolean {
  return /[.:]/.test(value) || value.startsWith("[") || value.includes("%");
}

/** Exercises the same ordering as classifyPixKey (see classify-pix-key.ts). */
function classifyWithIpGuard(raw: string): string {
  const trimmed = raw.trim();
  if (looksLikeIpNotation(trimmed) && parseIpAddress(trimmed)) {
    return "unsupported";
  }
  const digits = digitsOnly(trimmed);
  if (digits.length === 11) return "cpf";
  if (digits.length === 14) return "cnpj";
  if (parseIpAddress(trimmed)) return "unsupported";
  return "other";
}

test("IPv4 CIDR is unsupported before 14-digit CNPJ classification", () => {
  assert.equal(classifyWithIpGuard("152.207.114.163/24"), "unsupported");
  assert.equal(digitsOnly("152.207.114.163/24").length, 14);
});

test("bare 11-digit strings stay CPF when they also parse as decimal IPv4", () => {
  assert.equal(classifyWithIpGuard("02563732131"), "cpf");
  assert.ok(parseIpAddress("02563732131"));
});

test("formatted CNPJ still classifies when IP parse fails on dotted segments", () => {
  assert.equal(classifyWithIpGuard("12.345.678/0001-95"), "cnpj");
  assert.equal(parseIpAddress("12.345.678/0001-95"), null);
});

test("dotted IPv4 is unsupported before digit stripping", () => {
  assert.equal(classifyWithIpGuard("192.168.0.1"), "unsupported");
});
