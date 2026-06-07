import assert from "node:assert/strict";
import test from "node:test";
import { extractPixKey } from "./analyze.ts";
import { validateCrc } from "./crc.ts";
import { flattenNodes, parseBrCode } from "./parse.ts";
import {
  getSanitizeEligibility,
  isPayloadAlreadySanitized,
  sanitizeStaticPixPayload,
} from "./sanitize.ts";

const EVP_KEY = "123e4567-e12b-12d1-a456-426655440000";
const SAMPLE_STATIC_PAYLOAD =
  "00020101021126580014br.gov.bcb.pix0136" +
  EVP_KEY +
  "5204549953039865406100.005802BR5913Fulano de Tal6009SAO PAULO61080131010062070503***6304CDBC";

test("getSanitizeEligibility accepts static PIX with EVP key", () => {
  assert.deepEqual(getSanitizeEligibility(SAMPLE_STATIC_PAYLOAD), {
    eligible: true,
  });
});

test("sanitizeStaticPixPayload removes personal fields and keeps EVP key", () => {
  const sanitized = sanitizeStaticPixPayload(SAMPLE_STATIC_PAYLOAD);
  const parsed = parseBrCode(sanitized);

  assert.equal(parsed.error, undefined);
  assert.equal(validateCrc(sanitized).valid, true);
  assert.equal(extractPixKey(parsed.nodes), EVP_KEY);

  const rows = flattenNodes(parsed.nodes);
  const byPath = Object.fromEntries(rows.map((row) => [row.path, row.value]));

  assert.equal(byPath["52"], "0000");
  assert.equal(byPath["59"], "Pix");
  assert.equal(byPath["60"], "Brasil");
  assert.equal(byPath["62.05"], "***");
  assert.equal(byPath["54"], undefined);
  assert.equal(byPath["61"], undefined);
  assert.ok(!sanitized.includes("Fulano"));
  assert.ok(!sanitized.includes("SAO PAULO"));
  assert.ok(!sanitized.includes("01310100"));
  assert.ok(!sanitized.includes("100.00"));
});

test("isPayloadAlreadySanitized is false before sanitization", () => {
  assert.equal(isPayloadAlreadySanitized(SAMPLE_STATIC_PAYLOAD), false);
});

test("isPayloadAlreadySanitized is true after sanitization", () => {
  const sanitized = sanitizeStaticPixPayload(SAMPLE_STATIC_PAYLOAD);
  assert.equal(isPayloadAlreadySanitized(sanitized), true);
});

test("getSanitizeEligibility rejects CPF key payloads", () => {
  const cpfPayload =
    "00020101021126330014br.gov.bcb.pix0111123456789015204000053039865802BR5910JOAO SILVA6009SAO PAULO62070503***6304437E";
  const result = getSanitizeEligibility(cpfPayload);
  assert.equal(result.eligible, false);
  if (!result.eligible) assert.equal(result.reason, "not_evp");
});
