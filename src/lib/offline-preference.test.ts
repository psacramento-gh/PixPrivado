import assert from "node:assert/strict";
import test from "node:test";
import { parseOfflinePreference } from "./offline-preference.ts";

test("parseOfflinePreference treats 1 and true as enabled", () => {
  assert.equal(parseOfflinePreference("1"), true);
  assert.equal(parseOfflinePreference("true"), true);
});

test("parseOfflinePreference treats other values as disabled", () => {
  assert.equal(parseOfflinePreference(null), false);
  assert.equal(parseOfflinePreference(undefined), false);
  assert.equal(parseOfflinePreference(""), false);
  assert.equal(parseOfflinePreference("0"), false);
  assert.equal(parseOfflinePreference("false"), false);
  assert.equal(parseOfflinePreference("yes"), false);
});
