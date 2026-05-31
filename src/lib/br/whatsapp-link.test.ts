import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWhatsAppUrl,
  formatBrazilianMobileE164,
  getWhatsAppLinksFromValue,
  normalizeBrazilianMobileForWhatsApp,
} from "./whatsapp-link.ts";

test("normalizeBrazilianMobileForWhatsApp accepts current mobile formats", () => {
  assert.equal(normalizeBrazilianMobileForWhatsApp("+55 11 98765-4321"), "5511987654321");
  assert.equal(normalizeBrazilianMobileForWhatsApp("11987654321"), "5511987654321");
  assert.equal(normalizeBrazilianMobileForWhatsApp("5511987654321"), "5511987654321");
});

test("normalizeBrazilianMobileForWhatsApp migrates legacy 10-digit mobile", () => {
  assert.equal(normalizeBrazilianMobileForWhatsApp("1198765432"), "5511987654321");
});

test("normalizeBrazilianMobileForWhatsApp rejects landlines and invalid values", () => {
  assert.equal(normalizeBrazilianMobileForWhatsApp("(11) 3456-7890"), null);
  assert.equal(normalizeBrazilianMobileForWhatsApp("+1 415 555 0100"), null);
  assert.equal(normalizeBrazilianMobileForWhatsApp("123.456.789-01"), null);
});

test("buildWhatsAppUrl returns wa.me link without pre-filled message", () => {
  assert.equal(buildWhatsAppUrl("11987654321"), "https://wa.me/5511987654321");
});

test("formatBrazilianMobileE164", () => {
  assert.equal(formatBrazilianMobileE164("5511987654321"), "+55 (11) 98765-4321");
});

test("getWhatsAppLinksFromValue deduplicates comma-separated lists", () => {
  const links = getWhatsAppLinksFromValue("11987654321, +55 11 98765-4321, (11) 3456-7890");
  assert.equal(links.length, 1);
  assert.equal(links[0]?.url, "https://wa.me/5511987654321");
});
