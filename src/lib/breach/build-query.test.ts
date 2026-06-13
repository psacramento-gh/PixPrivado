import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEmailQuery,
  extractEmailFromQuery,
  isAllowedBreachQuery,
} from "./build-query";

test("buildEmailQuery prefixes email values", () => {
  assert.equal(buildEmailQuery("user@example.com"), "email:user@example.com");
});

test("extractEmailFromQuery parses allowed email queries", () => {
  assert.equal(extractEmailFromQuery("email:user@example.com"), "user@example.com");
  assert.equal(extractEmailFromQuery("name:foo"), null);
});

test("isAllowedBreachQuery accepts email queries only", () => {
  assert.equal(isAllowedBreachQuery("email:user@example.com"), true);
  assert.equal(isAllowedBreachQuery('name:"john doe"'), false);
  assert.equal(isAllowedBreachQuery("12345678000199"), false);
});
