import assert from "node:assert/strict";
import test from "node:test";
import { parseRemainingCredits } from "./parse-quota.ts";

test("parseRemainingCredits reads response headers", () => {
  const headers = new Headers({ "x-credits-remaining": "42" });
  assert.equal(parseRemainingCredits(headers, null), 42);
});

test("parseRemainingCredits reads JSON fields", () => {
  const headers = new Headers();
  assert.equal(
    parseRemainingCredits(headers, { remainingCredits: 7, success: true }),
    7,
  );
});

test("parseRemainingCredits returns null when absent", () => {
  assert.equal(parseRemainingCredits(new Headers(), { success: true }), null);
});
