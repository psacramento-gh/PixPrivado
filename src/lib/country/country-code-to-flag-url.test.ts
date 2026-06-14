import assert from "node:assert/strict";
import test from "node:test";
import { countryCodeToFlagSvgUrl } from "./country-code-to-flag-url.ts";

test("countryCodeToFlagSvgUrl builds same-origin SVG URLs for valid alpha-2 codes", () => {
  assert.equal(countryCodeToFlagSvgUrl("BR"), "/api/flags/BR");
  assert.equal(countryCodeToFlagSvgUrl("us"), "/api/flags/US");
});

test("countryCodeToFlagSvgUrl returns null for invalid codes", () => {
  assert.equal(countryCodeToFlagSvgUrl(""), null);
  assert.equal(countryCodeToFlagSvgUrl("ZZ"), null);
  assert.equal(countryCodeToFlagSvgUrl("BRA"), null);
});
