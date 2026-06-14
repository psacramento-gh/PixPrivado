import assert from "node:assert/strict";
import test from "node:test";
import { lookupMccDescription, parseMccCode } from "./lookup.ts";

test("parseMccCode normalizes digit-only MCC values to four digits", () => {
  assert.equal(parseMccCode("5812"), "5812");
  assert.equal(parseMccCode("812"), "0812");
  assert.equal(parseMccCode(" 541 "), "0541");
});

test("parseMccCode rejects malformed non-digit-only values", () => {
  assert.equal(parseMccCode("58-12"), null);
  assert.equal(parseMccCode("58 12"), null);
  assert.equal(parseMccCode("5812x"), null);
  assert.equal(parseMccCode("abcd"), null);
  assert.equal(parseMccCode(""), null);
  assert.equal(parseMccCode("58121"), null);
});

test("lookupMccDescription does not resolve malformed values after coercion", () => {
  assert.equal(lookupMccDescription("58-12"), null);
});

test("lookupMccDescription resolves known valid MCC codes", () => {
  const description = lookupMccDescription("5499");
  assert.ok(description);
  assert.match(description!, /Convenience Stores/i);
});
