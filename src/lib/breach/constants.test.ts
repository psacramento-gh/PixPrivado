import assert from "node:assert/strict";
import test from "node:test";
import { buildBreachLogoUrl } from "./constants";

test("buildBreachLogoUrl uses the HIBP logos CDN", () => {
  assert.equal(
    buildBreachLogoUrl("Adobe.png"),
    "https://logos.haveibeenpwned.com/Adobe.png",
  );
});

test("buildBreachLogoUrl preserves absolute URLs", () => {
  assert.equal(
    buildBreachLogoUrl("https://example.com/logo.png"),
    "https://example.com/logo.png",
  );
});
