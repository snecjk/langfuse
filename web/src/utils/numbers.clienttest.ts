// @vitest-environment node

import { describe, expect, it } from "vitest";

import { centCostFormatter, costFormatter } from "@/src/utils/numbers";
import {
  compactNumberFormatter,
  costFormatterWithLocale,
  latencyFormatterWithLocale,
  numberFormatter,
  usdFormatter,
} from "@/src/utils/numbers";

describe("costFormatter", () => {
  it("formats dashboard costs with cent precision", () => {
    expect(costFormatter(4.402973)).toBe("$4.40");
    expect(costFormatter(0.068415)).toBe("$0.07");
    expect(costFormatter(0.015427)).toBe("$0.02");
    expect(costFormatter(0)).toBe("$0.00");
  });

  it("keeps sub-cent costs visible instead of rounding them to $0.00", () => {
    expect(costFormatter(0.000601)).toBe("$0.000601");
  });

  it("uses cent precision from one cent up", () => {
    expect(costFormatter(0.01)).toBe("$0.01");
    // Three significant digits can still round up to a full cent.
    expect(costFormatter(0.009999)).toBe("$0.01");
  });

  it("stops widening at ten fraction digits", () => {
    expect(costFormatter(0.0000000001)).toBe("$0.0000000001");
    expect(costFormatter(0.00000000001)).toBe("$0.00");
  });

  it("formats missing and negative costs", () => {
    expect(costFormatter(undefined)).toBe("$0.00");
    expect(costFormatter(-0.000601)).toBe("-$0.000601");
    expect(costFormatter(-4.402973)).toBe("-$4.40");
  });
});

describe("centCostFormatter", () => {
  it("rounds to cents and flags sub-cent costs instead of showing $0.00", () => {
    expect(centCostFormatter(0.36674048)).toBe("$0.37");
    expect(centCostFormatter(0.005)).toBe("$0.01");
    expect(centCostFormatter(0.0049)).toBe("<$0.01");
    expect(centCostFormatter(0)).toBe("$0.00");
  });

  it("keeps the sign on negative costs", () => {
    expect(centCostFormatter(-0.37)).toBe("-$0.37");
    expect(centCostFormatter(-0.0049)).toBe("-<$0.01");
  });
});

describe("numberFormatter (locale)", () => {
  it("uses Chinese grouping for zh-CN and US grouping for en", () => {
    expect(numberFormatter(1234567, 0, undefined, "zh-CN")).toBe("1,234,567");
    expect(numberFormatter(1234567, 0, undefined, "en")).toBe("1,234,567");
  });

  it("respects fraction digits per locale", () => {
    expect(numberFormatter(1234.5, 1, undefined, "zh-CN")).toBe("1,234.5");
    expect(numberFormatter(1234.5, 1, undefined, "en")).toBe("1,234.5");
  });
});

describe("compactNumberFormatter (locale)", () => {
  it("renders compact notation in zh-CN and en", () => {
    expect(compactNumberFormatter(1500000, undefined, "zh-CN")).toBe("150万");
    expect(compactNumberFormatter(1500000, undefined, "en")).toBe("1.5M");
  });
});

describe("usdFormatter (locale)", () => {
  it("keeps USD currency code while using locale decimal grouping", () => {
    expect(usdFormatter(1234.5, 2, 2, "zh-CN")).toBe("US$1,234.50");
    expect(usdFormatter(1234.5, 2, 2, "en")).toBe("$1,234.50");
  });

  it("uses the passed locale for sub-cent widening", () => {
    expect(usdFormatter(0.000601, 2, 10, "zh-CN")).toBe("US$0.000601");
    expect(usdFormatter(0.000601, 2, 10, "en")).toBe("$0.000601");
  });
});

describe("costFormatterWithLocale (locale)", () => {
  it("formats costs with locale", () => {
    expect(costFormatterWithLocale(4.402973, "zh-CN")).toBe("US$4.40");
    expect(costFormatterWithLocale(4.402973, "en")).toBe("$4.40");
    expect(costFormatterWithLocale(0.000601, "zh-CN")).toBe("US$0.000601");
  });
});

describe("latencyFormatterWithLocale (locale)", () => {
  it("renders duration units in zh-CN and en", () => {
    expect(latencyFormatterWithLocale(1500, "zh-CN")).toBe("1.5秒");
    expect(latencyFormatterWithLocale(1500, "en")).toBe("1.5s");
  });
});
