import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTelUrl,
  formatBrazilianLandlineE164,
  getPhoneLinksFromValue,
  normalizeBrazilianLandlineForTel,
} from "./phone-link.ts";

test("normalizeBrazilianLandlineForTel accepts landline formats", () => {
  assert.equal(normalizeBrazilianLandlineForTel("(11) 3456-7890"), "551134567890");
  assert.equal(normalizeBrazilianLandlineForTel("+55 11 3456-7890"), "551134567890");
  assert.equal(normalizeBrazilianLandlineForTel("1134567890"), "551134567890");
});

test("normalizeBrazilianLandlineForTel rejects mobiles and invalid values", () => {
  assert.equal(normalizeBrazilianLandlineForTel("11987654321"), null);
  assert.equal(normalizeBrazilianLandlineForTel("+1 415 555 0100"), null);
  assert.equal(normalizeBrazilianLandlineForTel("123.456.789-01"), null);
});

test("buildTelUrl returns tel link", () => {
  assert.equal(buildTelUrl("(11) 3456-7890"), "tel:+551134567890");
});

test("formatBrazilianLandlineE164", () => {
  assert.equal(formatBrazilianLandlineE164("551134567890"), "+55 (11) 3456-7890");
});

test("getPhoneLinksFromValue returns tel for landline and whatsapp for mobile", () => {
  const links = getPhoneLinksFromValue("11987654321, (11) 3456-7890");
  assert.equal(links.length, 2);
  assert.equal(links[0]?.kind, "whatsapp");
  assert.equal(links[0]?.url, "https://wa.me/5511987654321");
  assert.equal(links[1]?.kind, "tel");
  assert.equal(links[1]?.url, "tel:+551134567890");
});
