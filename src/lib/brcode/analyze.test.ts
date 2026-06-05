import assert from "node:assert/strict";
import test from "node:test";
import { detectQrKind } from "./analyze.ts";
import type { TlvNode } from "./parse.ts";

test("detectQrKind treats POI 12 as dynamic", () => {
  const nodes: TlvNode[] = [
    { id: "00", length: 2, value: "01" },
    { id: "01", length: 2, value: "12" },
  ];
  assert.equal(detectQrKind(nodes), "dynamic");
});

test("detectQrKind treats PIX GUI without location URL as static", () => {
  const nodes: TlvNode[] = [
    {
      id: "26",
      length: 14,
      value: "",
      children: [{ id: "00", length: 14, value: "br.gov.bcb.pix" }],
    },
  ];
  assert.equal(detectQrKind(nodes), "static");
});

test("detectQrKind treats location URL in merchant account as dynamic", () => {
  const nodes: TlvNode[] = [
    {
      id: "26",
      length: 40,
      value: "",
      children: [
        { id: "00", length: 14, value: "br.gov.bcb.pix" },
        { id: "25", length: 24, value: "https://example.com/cob" },
      ],
    },
  ];
  assert.equal(detectQrKind(nodes), "dynamic");
});
