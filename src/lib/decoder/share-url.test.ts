import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDecoderSharePath,
  buildDecoderShareUrl,
  parseDecoderPayloadFromSearch,
  truncateShareUrlForDisplay,
} from "./share-url.ts";

const SAMPLE_PAYLOAD =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000";

test("buildDecoderSharePath returns root when payload is empty", () => {
  assert.equal(buildDecoderSharePath(""), "/");
  assert.equal(buildDecoderSharePath("   "), "/");
});

test("buildDecoderSharePath encodes payload in query param", () => {
  assert.equal(
    buildDecoderSharePath(SAMPLE_PAYLOAD),
    `/?p=${encodeURIComponent(SAMPLE_PAYLOAD)}`,
  );
});

test("buildDecoderShareUrl joins origin and path", () => {
  assert.equal(
    buildDecoderShareUrl(SAMPLE_PAYLOAD, "https://example.com"),
    `https://example.com/?p=${encodeURIComponent(SAMPLE_PAYLOAD)}`,
  );
  assert.equal(
    buildDecoderShareUrl(SAMPLE_PAYLOAD, "https://example.com/"),
    `https://example.com/?p=${encodeURIComponent(SAMPLE_PAYLOAD)}`,
  );
});

test("parseDecoderPayloadFromSearch round-trips encoded payload", () => {
  const path = buildDecoderSharePath(SAMPLE_PAYLOAD);
  const search = path.slice(path.indexOf("?"));
  assert.equal(parseDecoderPayloadFromSearch(search), SAMPLE_PAYLOAD);
});

test("parseDecoderPayloadFromSearch returns null when param is missing or blank", () => {
  assert.equal(parseDecoderPayloadFromSearch(""), null);
  assert.equal(parseDecoderPayloadFromSearch("?p="), null);
  assert.equal(parseDecoderPayloadFromSearch("?p=%20%20"), null);
});

test("truncateShareUrlForDisplay leaves short urls unchanged", () => {
  assert.equal(
    truncateShareUrlForDisplay("https://a.co/?p=abc"),
    "https://a.co/?p=abc",
  );
});

test("truncateShareUrlForDisplay truncates long urls in the middle", () => {
  const url = `https://example.com/?p=${"x".repeat(80)}`;
  const shown = truncateShareUrlForDisplay(url, 20);
  assert.equal(shown.length, 20);
  assert.match(shown, /…/);
});

