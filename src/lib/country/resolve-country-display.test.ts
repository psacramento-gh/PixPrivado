import assert from "node:assert/strict";
import test from "node:test";
import {
  isCountryCodeRow,
  resolveCountryDisplay,
} from "./resolve-country-display.ts";
import {
  lookupIso3166EnglishName,
  normalizeIso3166Alpha2,
} from "./iso3166.ts";

test("normalizeIso3166Alpha2 uppercases and validates alpha-2 codes", () => {
  assert.equal(normalizeIso3166Alpha2("br"), "BR");
  assert.equal(normalizeIso3166Alpha2(" BR "), "BR");
  assert.equal(normalizeIso3166Alpha2("BRA"), null);
  assert.equal(normalizeIso3166Alpha2("B1"), null);
});

test("lookupIso3166EnglishName resolves active ISO 3166-1 alpha-2 codes", () => {
  assert.equal(lookupIso3166EnglishName("BR"), "Brazil");
  assert.equal(lookupIso3166EnglishName("US"), "United States of America");
  assert.equal(lookupIso3166EnglishName("ZZ"), null);
});

test("resolveCountryDisplay uses localized labels for BR", () => {
  const en = resolveCountryDisplay("BR", "en");
  assert.ok(en);
  assert.equal(en!.flag, "🇧🇷");
  assert.equal(en!.name, "Brazil");
  assert.match(en!.ariaLabel, /Brazil/);
  assert.match(en!.ariaLabel, /BR/);

  const pt = resolveCountryDisplay("BR", "pt");
  assert.ok(pt);
  assert.equal(pt!.flag, "🇧🇷");
  assert.equal(pt!.name, "Brasil");
  assert.match(pt!.ariaLabel, /Brasil/);
});

test("resolveCountryDisplay falls back to ISO reference data for English", () => {
  const display = resolveCountryDisplay("JP", "en");
  assert.ok(display);
  assert.equal(display!.alpha2, "JP");
  assert.equal(display!.name, "Japan");
  assert.equal(display!.flag, "🇯🇵");
});

test("resolveCountryDisplay returns null for unknown country codes", () => {
  assert.equal(resolveCountryDisplay("ZZ", "en"), null);
  assert.equal(resolveCountryDisplay("", "en"), null);
});

test("isCountryCodeRow matches only top-level EMV tag 58", () => {
  assert.equal(
    isCountryCodeRow({ id: "58", parentId: null }),
    true,
  );
  assert.equal(
    isCountryCodeRow({ id: "58", parentId: "00" }),
    false,
  );
  assert.equal(
    isCountryCodeRow({ id: "53", parentId: null }),
    false,
  );
});
