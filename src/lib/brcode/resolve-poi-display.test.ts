import assert from "node:assert/strict";
import test from "node:test";
import {
  isPointOfInitiationRow,
  resolvePoiDisplay,
} from "./resolve-poi-display.ts";

test("resolvePoiDisplay maps 11 and 12 to localized static/dynamic labels", () => {
  const staticEn = resolvePoiDisplay("11", "en");
  assert.ok(staticEn);
  assert.equal(staticEn!.kind, "static");
  assert.equal(staticEn!.label, "static");
  assert.match(staticEn!.ariaLabel, /static/i);

  const staticPt = resolvePoiDisplay("11", "pt");
  assert.ok(staticPt);
  assert.equal(staticPt!.label, "estático");

  const dynamicEn = resolvePoiDisplay("12", "en");
  assert.ok(dynamicEn);
  assert.equal(dynamicEn!.kind, "dynamic");
  assert.equal(dynamicEn!.label, "dynamic");

  const dynamicPt = resolvePoiDisplay("12", "pt");
  assert.ok(dynamicPt);
  assert.equal(dynamicPt!.label, "dinâmico");
});

test("resolvePoiDisplay returns null for unknown POI values", () => {
  assert.equal(resolvePoiDisplay("10", "en"), null);
  assert.equal(resolvePoiDisplay("", "en"), null);
});

test("isPointOfInitiationRow matches only top-level EMV tag 01", () => {
  assert.equal(isPointOfInitiationRow({ id: "01", parentId: null }), true);
  assert.equal(isPointOfInitiationRow({ id: "01", parentId: "26" }), false);
  assert.equal(isPointOfInitiationRow({ id: "53", parentId: null }), false);
});
