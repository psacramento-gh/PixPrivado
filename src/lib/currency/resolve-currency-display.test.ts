import assert from "node:assert/strict";
import test from "node:test";
import { resolveCurrencyDisplay } from "./resolve-currency-display.ts";
import {
  lookupIso4217Alpha,
  normalizeIso4217Numeric,
} from "./iso4217.ts";

test("normalizeIso4217Numeric pads and validates numeric codes", () => {
  assert.equal(normalizeIso4217Numeric("986"), "986");
  assert.equal(normalizeIso4217Numeric("36"), "036");
  assert.equal(normalizeIso4217Numeric("008"), "008");
  assert.equal(normalizeIso4217Numeric("abc"), null);
  assert.equal(normalizeIso4217Numeric("1234"), null);
});

test("lookupIso4217Alpha resolves active ISO 4217 codes", () => {
  assert.equal(lookupIso4217Alpha("986"), "BRL");
  assert.equal(lookupIso4217Alpha("840"), "USD");
  assert.equal(lookupIso4217Alpha("999"), null);
});

test("resolveCurrencyDisplay uses manual localized labels for BRL", () => {
  const en = resolveCurrencyDisplay("986", "en");
  assert.ok(en);
  assert.equal(en!.symbol, "R$");
  assert.equal(en!.name, "Brazilian Real");
  assert.match(en!.ariaLabel, /Brazilian Real/);
  assert.match(en!.ariaLabel, /BRL/);
  assert.match(en!.ariaLabel, /986/);

  const pt = resolveCurrencyDisplay("986", "pt");
  assert.ok(pt);
  assert.equal(pt!.symbol, "R$");
  assert.equal(pt!.name, "Real brasileiro");
  assert.match(pt!.ariaLabel, /Real brasileiro/);
});

test("resolveCurrencyDisplay falls back to ISO reference data for unknown manual labels", () => {
  const display = resolveCurrencyDisplay("352", "en");
  assert.ok(display);
  assert.equal(display!.alpha, "ISK");
  assert.equal(display!.name, "Iceland Krona");
});

test("resolveCurrencyDisplay returns null for unknown numeric codes", () => {
  assert.equal(resolveCurrencyDisplay("999", "en"), null);
  assert.equal(resolveCurrencyDisplay("", "en"), null);
});
