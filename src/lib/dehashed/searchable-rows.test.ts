import assert from "node:assert/strict";
import test from "node:test";
import { PIX_GUI } from "./constants";
import {
  buildPortalUrlForPixKeyRow,
  rowHasPixKeyPortalLink,
} from "./searchable-rows";

const pixRows = [
  { id: "26", parentId: null, value: "" },
  { id: "00", parentId: "26", value: PIX_GUI },
  { id: "01", parentId: "26", value: "02563732131" },
];

test("buildPortalUrlForPixKeyRow links CPF PIX keys to Portal da Transparência", () => {
  const row = pixRows[2]!;
  const url = buildPortalUrlForPixKeyRow(row, pixRows);
  assert.ok(url?.includes("/pessoa-fisica/"));
  assert.ok(url?.includes("termo=025.637.321-31"));
  assert.equal(rowHasPixKeyPortalLink(row, pixRows), true);
});

test("buildPortalUrlForPixKeyRow skips email PIX keys", () => {
  const rows = [
    ...pixRows.slice(0, 2),
    { id: "01", parentId: "26", value: "user@example.com" },
  ];
  const row = rows[2]!;
  assert.equal(buildPortalUrlForPixKeyRow(row, rows), null);
  assert.equal(rowHasPixKeyPortalLink(row, rows), false);
});
