import assert from "node:assert/strict";
import test from "node:test";
import { buildMerchantNameGoogleSearchUrl } from "./merchant-name-link.ts";

test("buildMerchantNameGoogleSearchUrl uses exact raw name", () => {
  const raw = "LUCIANA BENJAMIM FREDERIC";
  const url = buildMerchantNameGoogleSearchUrl(raw);
  assert.ok(url);
  assert.equal(new URL(url!).searchParams.get("q"), raw);
});

test("buildMerchantNameGoogleSearchUrl skips identifiers", () => {
  assert.equal(buildMerchantNameGoogleSearchUrl("12345678000195"), null);
  assert.equal(buildMerchantNameGoogleSearchUrl("02563732131"), null);
  assert.equal(buildMerchantNameGoogleSearchUrl("a@b.co"), null);
});

test("buildMerchantNameGoogleSearchUrl rejects empty values", () => {
  assert.equal(buildMerchantNameGoogleSearchUrl("   "), null);
});
