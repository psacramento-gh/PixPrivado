import assert from "node:assert/strict";
import test from "node:test";
import {
  dehashedPageExceedsTotal,
  dehashedTotalPages,
  getDehashedPaginationMeta,
} from "./pagination.ts";

test("dehashedTotalPages", () => {
  assert.equal(dehashedTotalPages(0, 50), 1);
  assert.equal(dehashedTotalPages(69, 50), 2);
  assert.equal(dehashedTotalPages(50, 50), 1);
  assert.equal(dehashedTotalPages(51, 50), 2);
});

test("getDehashedPaginationMeta first page", () => {
  const meta = getDehashedPaginationMeta(1, 50, 69, 50, 0);
  assert.equal(meta.rangeFrom, 1);
  assert.equal(meta.rangeTo, 50);
  assert.equal(meta.hasPrevious, false);
  assert.equal(meta.hasNext, true);
  assert.equal(meta.totalPages, 2);
});

test("getDehashedPaginationMeta last page", () => {
  const meta = getDehashedPaginationMeta(2, 50, 69, 19, 50);
  assert.equal(meta.rangeFrom, 51);
  assert.equal(meta.rangeTo, 69);
  assert.equal(meta.hasPrevious, true);
  assert.equal(meta.hasNext, false);
});

test("dehashedPageExceedsTotal", () => {
  assert.equal(dehashedPageExceedsTotal(3, 69, 50), true);
  assert.equal(dehashedPageExceedsTotal(2, 69, 50), false);
});
