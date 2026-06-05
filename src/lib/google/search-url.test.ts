import assert from "node:assert/strict";
import test from "node:test";
import { buildGoogleSearchUrl } from "./search-url.ts";

test("buildGoogleSearchUrl uses advanced search params for Brazil", () => {
  const url = buildGoogleSearchUrl("LUCIANA BENJAMIM FREDERIC");
  const parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, "https://www.google.com.br/search");
  assert.equal(parsed.searchParams.get("as_q"), "LUCIANA BENJAMIM FREDERIC");
  assert.equal(parsed.searchParams.get("lr"), "lang_pt");
  assert.equal(parsed.searchParams.get("cr"), "countryBR");
});

test("buildGoogleSearchUrl trims surrounding whitespace", () => {
  const url = buildGoogleSearchUrl("  Joao Silva  ");
  assert.equal(new URL(url).searchParams.get("as_q"), "Joao Silva");
});
