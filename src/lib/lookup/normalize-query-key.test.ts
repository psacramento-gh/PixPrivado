import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLookupQueryKey } from "./normalize-query-key.ts";

test("normalizeLookupQueryKey normalizes bare CPF digits", () => {
  assert.equal(normalizeLookupQueryKey("12345678901"), "12345678901");
});

test("normalizeLookupQueryKey normalizes formatted CPF to digits", () => {
  assert.equal(normalizeLookupQueryKey("123.456.789-01"), "12345678901");
});

test("normalizeLookupQueryKey normalizes bare CNPJ digits", () => {
  assert.equal(normalizeLookupQueryKey("12345678000199"), "12345678000199");
});

test("normalizeLookupQueryKey normalizes formatted CNPJ to digits", () => {
  assert.equal(normalizeLookupQueryKey("12.345.678/0001-99"), "12345678000199");
});

test("normalizeLookupQueryKey leaves dehashed queries unchanged", () => {
  assert.equal(
    normalizeLookupQueryKey("email:user@example.com"),
    "email:user@example.com",
  );
  assert.equal(normalizeLookupQueryKey('name:"john doe"'), 'name:"john doe"');
});
