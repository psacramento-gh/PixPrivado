import assert from "node:assert/strict";
import test from "node:test";
import { localeFromGeoSignals } from "./locale-from-geo.ts";

test("localeFromGeoSignals returns pt for Brazil", () => {
  assert.equal(localeFromGeoSignals("BR", null), "pt");
});

test("localeFromGeoSignals returns en for non-Brazil countries", () => {
  assert.equal(localeFromGeoSignals("US", null), "en");
  assert.equal(localeFromGeoSignals("PT", null), "en");
});

test("localeFromGeoSignals falls back to Accept-Language when country is unknown", () => {
  assert.equal(localeFromGeoSignals(null, "pt-BR,pt;q=0.9,en;q=0.8"), "pt");
  assert.equal(localeFromGeoSignals(undefined, "en-US,en;q=0.9"), "en");
});
