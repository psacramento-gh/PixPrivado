import assert from "node:assert/strict";
import test from "node:test";
import { countryCodeToFlagEmoji } from "./country-code-to-flag-emoji.ts";

test("countryCodeToFlagEmoji builds regional-indicator flags", () => {
  assert.equal(countryCodeToFlagEmoji("BR"), "🇧🇷");
  assert.equal(countryCodeToFlagEmoji("us"), "🇺🇸");
});

test("countryCodeToFlagEmoji returns null for invalid codes", () => {
  assert.equal(countryCodeToFlagEmoji(""), null);
  assert.equal(countryCodeToFlagEmoji("ZZZ"), null);
  assert.equal(countryCodeToFlagEmoji("B1"), null);
});
