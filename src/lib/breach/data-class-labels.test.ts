import assert from "node:assert/strict";
import test from "node:test";
import { translateDataClass, translateDataClasses } from "./data-class-labels";

test("translateDataClass returns Portuguese labels for known classes", () => {
  assert.equal(translateDataClass("Email addresses", "pt"), "Endereços de e-mail");
  assert.equal(translateDataClass("Passwords", "pt"), "Senhas");
});

test("translateDataClass leaves English unchanged for en locale", () => {
  assert.equal(translateDataClass("Email addresses", "en"), "Email addresses");
});

test("translateDataClass falls back to English for unknown classes", () => {
  assert.equal(translateDataClass("Future data type", "pt"), "Future data type");
});

test("translateDataClasses maps arrays", () => {
  assert.deepEqual(
    translateDataClasses(["Email addresses", "Passwords"], "pt"),
    ["Endereços de e-mail", "Senhas"],
  );
});
