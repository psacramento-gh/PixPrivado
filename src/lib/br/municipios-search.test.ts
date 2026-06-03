import { describe, expect, it } from "vitest";
import {
  normalizeCityForMatch,
  parseBrazilianUfParam,
  parseMerchantCityQuery,
} from "@/lib/br/normalize-city-query";

describe("normalizeCityForMatch", () => {
  it("folds accents and case", () => {
    expect(normalizeCityForMatch("  São   Paulo ")).toBe("SAO PAULO");
  });
});

describe("parseMerchantCityQuery", () => {
  it("rejects too-short queries", () => {
    expect(parseMerchantCityQuery("A")).toBeNull();
    expect(parseMerchantCityQuery("  ")).toBeNull();
  });

  it("accepts two or more characters", () => {
    expect(parseMerchantCityQuery("SP")).toBe("SP");
    expect(parseMerchantCityQuery("Rio")).toBe("RIO");
  });
});

describe("parseBrazilianUfParam", () => {
  it("accepts valid UF codes", () => {
    expect(parseBrazilianUfParam("sp")).toBe("SP");
  });

  it("rejects invalid values", () => {
    expect(parseBrazilianUfParam("SPA")).toBeNull();
    expect(parseBrazilianUfParam("")).toBeNull();
  });
});
