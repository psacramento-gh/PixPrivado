import assert from "node:assert/strict";
import test from "node:test";
import {
  computeCpfCheckDigits,
  enumerateCpfCandidates,
  isValidCpf,
  parseCpfSocioSlots,
} from "./cpf-candidates.ts";

test("parseCpfSocioSlots accepts mask and full CPF", () => {
  assert.deepEqual(parseCpfSocioSlots("***972696**"), ["*", "*", "*", "9", "7", "2", "6", "9", "6", "*", "*"]);
  assert.deepEqual(parseCpfSocioSlots("52998224725"), "52998224725".split(""));
  assert.equal(parseCpfSocioSlots("12.345.678/0001-95"), null);
});

test("computeCpfCheckDigits for known valid CPF", () => {
  assert.equal(computeCpfCheckDigits("529982247"), "25");
  assert.ok(isValidCpf("52998224725"));
});

test("rejects all-same-digit CPF", () => {
  assert.equal(isValidCpf("11111111111"), false);
});

test("enumerateCpfCandidates for mask yields only valid CPFs", () => {
  const candidates = enumerateCpfCandidates("***972696**");
  assert.equal(candidates.length, 1000);
  for (const digits of candidates) {
    assert.ok(isValidCpf(digits));
    assert.equal(digits.slice(3, 9), "972696");
  }
});

test("enumerateCpfCandidates for full valid CPF", () => {
  assert.deepEqual(enumerateCpfCandidates("52998224725"), ["52998224725"]);
});

test("enumerateCpfCandidates for invalid full CPF", () => {
  assert.deepEqual(enumerateCpfCandidates("11111111111"), []);
});
