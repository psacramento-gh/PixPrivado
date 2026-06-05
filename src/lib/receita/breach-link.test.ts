import assert from "node:assert/strict";
import test from "node:test";
import { buildBreachLookupQuery } from "./breach-link";

test("buildBreachLookupQuery returns email queries only", () => {
  assert.equal(buildBreachLookupQuery("user@example.com"), "email:user@example.com");
  assert.equal(buildBreachLookupQuery("+5511987654321"), null);
  assert.equal(buildBreachLookupQuery("(11) 98765-4321"), null);
  assert.equal(buildBreachLookupQuery("11987654321"), null);
});
