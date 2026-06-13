import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeBreachDescription } from "./sanitize-description";

test("sanitizeBreachDescription keeps HIBP-style markup", () => {
  const input =
    'In October 2013, accounts were <em>encrypted</em>. <a href="https://example.com" target="_blank" rel="noopener">more</a>';
  const output = sanitizeBreachDescription(input);
  assert.match(output, /<em>encrypted<\/em>/);
  assert.match(output, /href="https:\/\/example\.com"/);
});

test("sanitizeBreachDescription strips executable markup", () => {
  const input = '<img src=x onerror="alert(1)"><a href="javascript:alert(1)">x</a>';
  const output = sanitizeBreachDescription(input);
  assert.doesNotMatch(output, /onerror/i);
  assert.doesNotMatch(output, /javascript:/i);
  assert.doesNotMatch(output, /<img/i);
});
