import assert from "node:assert/strict";
import test from "node:test";
import { buildGoogleSearchUrl } from "./search-url.ts";

test("buildGoogleSearchUrl uses google.com.br with Brazilian locale hints", () => {
  const url = buildGoogleSearchUrl("LUCIANA BENJAMIM FREDERIC");
  const parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, "https://www.google.com.br/search");
  assert.equal(parsed.searchParams.get("q"), "LUCIANA BENJAMIM FREDERIC");
  assert.equal(parsed.searchParams.get("hl"), "pt-BR");
  assert.equal(parsed.searchParams.get("gl"), "br");
});

test("buildGoogleSearchUrl trims surrounding whitespace", () => {
  const url = buildGoogleSearchUrl("  Joao Silva  ");
  assert.equal(new URL(url).searchParams.get("q"), "Joao Silva");
});
