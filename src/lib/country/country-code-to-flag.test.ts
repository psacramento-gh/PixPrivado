import assert from "node:assert/strict";
import test from "node:test";
import { countryCodeToFlagEmoji } from "./country-code-to-flag.ts";

test("countryCodeToFlagEmoji maps alpha-2 codes to regional indicator flags", () => {
  assert.equal(countryCodeToFlagEmoji("BR"), "🇧🇷");
  assert.equal(countryCodeToFlagEmoji("us"), "🇺🇸");
  assert.equal(countryCodeToFlagEmoji(" PT "), "🇵🇹");
});

test("countryCodeToFlagEmoji returns null for invalid codes", () => {
  assert.equal(countryCodeToFlagEmoji(""), null);
  assert.equal(countryCodeToFlagEmoji("BRA"), null);
  assert.equal(countryCodeToFlagEmoji("B1"), null);
});
