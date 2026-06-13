import assert from "node:assert/strict";
import test from "node:test";
import { isCpfSearchQuery, normalizeCpfDigits } from "./cpf-query.ts";

test("isCpfSearchQuery accepts 11 digits only", () => {
  assert.equal(isCpfSearchQuery("52998224725"), true);
  assert.equal(isCpfSearchQuery("529.982.247-25"), false);
  assert.equal(isCpfSearchQuery("12345678901234"), false);
});

test("normalizeCpfDigits strips non-digits", () => {
  assert.equal(normalizeCpfDigits("529.982.247-25"), "52998224725");
});
