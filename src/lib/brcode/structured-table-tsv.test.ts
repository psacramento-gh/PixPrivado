import assert from "node:assert/strict";
import test from "node:test";
import { buildStructuredTableTsv } from "./structured-table-tsv.ts";
import { flattenNodes, parseBrCode } from "./parse.ts";

const SAMPLE_STATIC_PAYLOAD =
  "00020101021126580014br.gov.bcb.pix0136" +
  "123e4567-e12b-12d1-a456-426655440000" +
  "5204549953039865406100.005802BR5913Fulano de Tal6009SAO PAULO61080131010062070503***6304CDBC";

test("buildStructuredTableTsv uses localized labels and raw TLV values", () => {
  const rows = flattenNodes(parseBrCode(SAMPLE_STATIC_PAYLOAD).nodes);

  const tsv = buildStructuredTableTsv(rows, "en");

  assert.match(tsv, /^Label\tValue\n/);
  assert.match(tsv, /\nPoint of Initiation Method\t11\n/);
  assert.match(tsv, /\nTransaction Currency\t986\n/);
  assert.match(tsv, /\nPostal Code\t01310100\n/);
  assert.match(tsv, /\nCRC16\tCDBC\n/);
  assert.doesNotMatch(tsv, /\t01310-100/);
  assert.doesNotMatch(tsv, /\t0xCDBC/);
});

test("buildStructuredTableTsv leaves template row values empty", () => {
  const rows = flattenNodes(parseBrCode(SAMPLE_STATIC_PAYLOAD).nodes);
  const merchantTemplate = rows.find((row) => row.id === "26" && row.isTemplate);

  assert.ok(merchantTemplate);
  assert.ok(merchantTemplate!.value.length > 0);

  const tsv = buildStructuredTableTsv(rows, "en", { includeHeader: false });
  const templateLine = tsv
    .split("\n")
    .find((line) => line.startsWith("Merchant Account Information (PIX)\t"));

  assert.equal(templateLine, "Merchant Account Information (PIX)\t");
});

test("buildStructuredTableTsv escapes tabs and newlines in cell values", () => {
  const tsv = buildStructuredTableTsv(
    [
      {
        path: "59",
        id: "59",
        parentId: null,
        length: 5,
        value: "ACME\tLtd\nBR",
        depth: 0,
        isTemplate: false,
      },
    ],
    "en",
    { includeHeader: false },
  );

  assert.equal(tsv, 'Merchant Name\t"ACME\tLtd\nBR"');
});
