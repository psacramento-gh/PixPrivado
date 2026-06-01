import assert from "node:assert/strict";
import test from "node:test";
import { cpfHubBirthDateToIso } from "./brazil-birth-date.ts";

test("cpfHubBirthDateToIso converts DD/MM/YYYY", () => {
  assert.equal(cpfHubBirthDateToIso("15/06/1990"), "1990-06-15");
});

test("cpfHubBirthDateToIso rejects invalid strings", () => {
  assert.equal(cpfHubBirthDateToIso("1990-06-15"), null);
  assert.equal(cpfHubBirthDateToIso(""), null);
});
