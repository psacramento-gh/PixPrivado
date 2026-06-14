import assert from "node:assert/strict";
import test from "node:test";
import {
  isTopLevelLookupError,
  normalizeLookupApiResponse,
} from "./parse-api-response";

test("normalizeLookupApiResponse accepts wrapped cnpj responses", () => {
  const json = {
    kind: "cnpj",
    query: "30407634000124",
    result: { ok: true, cnpj: "30407634000124", data: { cnpj: "30407634000124" } },
  };
  const parsed = normalizeLookupApiResponse(json);
  assert.equal(parsed?.kind, "cnpj");
  assert.equal(parsed?.result.ok, true);
});

test("normalizeLookupApiResponse accepts bare receita results", () => {
  const json = { ok: false, cnpj: "30407634000124", error: "unavailable" as const };
  const parsed = normalizeLookupApiResponse(json);
  assert.equal(parsed?.kind, "cnpj");
  assert.equal(parsed?.result.ok, false);
});

test("isTopLevelLookupError ignores receita-shaped bodies", () => {
  assert.equal(
    isTopLevelLookupError({ ok: false, cnpj: "30407634000124", error: "unavailable" }),
    false,
  );
  assert.equal(isTopLevelLookupError({ error: "Invalid query" }), true);
});
