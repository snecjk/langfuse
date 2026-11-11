// @vitest-environment node

// @vitest-environment jsdom

import { describe, it, expect, vi } from "vitest";
import {
  formatCompactRelativeTime,
  formatIntervalSeconds,
  formatApproximateDuration,
  getRelativeTimestampFromNow,
  buildLocalIsoDatePresentation,
} from "@/src/utils/dates";

describe("formatCompactRelativeTime", () => {
  const ago = (seconds: number) => new Date(Date.now() - seconds * 1000);
  const DAY = 24 * 60 * 60;

  it.each([
    [30, "just now"],
    [5 * 60, "5m ago"],
    [3 * 60 * 60, "3h ago"],
    [15 * DAY, "15d ago"],
    [45 * DAY, "1mo ago"],
    // days 360-364 must stay in months, not round down to "0y ago"
    [362 * DAY, "12mo ago"],
    [400 * DAY, "1y ago"],
    [800 * DAY, "2y ago"],
  ])("formats %ds ago as %s", (seconds, expected) => {
    expect(formatCompactRelativeTime(ago(seconds))).toBe(expected);
  });

  it("clamps future timestamps to just now", () => {
    expect(formatCompactRelativeTime(ago(-120))).toBe("just now");
  });

  it("localizes relative displays without changing the timestamp or ISO representation", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-20T12:00:00Z"));
      const timestamp = new Date("2026-01-20T09:00:00Z");
      const original = timestamp.getTime();
      expect(formatCompactRelativeTime(timestamp, "zh-CN")).toBe("3小时前");
      expect(getRelativeTimestampFromNow(timestamp, "zh-CN")).toBe("3小时前");
      expect(formatApproximateDuration(61, "zh-CN")).toBe("2分钟");
      expect(formatApproximateDuration(61, "en")).toBe("2 minutes");
      const english = buildLocalIsoDatePresentation({
        date: timestamp,
        locale: "en",
      });
      const chinese = buildLocalIsoDatePresentation({
        date: timestamp,
        locale: "zh-CN",
      });
      expect(chinese?.display).toBe(english?.display);
      expect(chinese?.title).toContain("本地时间:");
      expect(timestamp.getTime()).toBe(original);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("formatIntervalSeconds", () => {
  it("keeps sub-minute durations in decimal-seconds form", () => {
    expect(formatIntervalSeconds(5)).toBe("5.00s");
    expect(formatIntervalSeconds(59.4, 1)).toBe("59.4s");
  });

  it("zero-pads single-digit minute/second components", () => {
    // pad() previously sliced from the front ("005".slice(2) === "5"), so
    // single-digit components rendered unpadded ("20m 0s", "1h 5m 3s").
    expect(formatIntervalSeconds(1200)).toBe("20m 00s");
    expect(formatIntervalSeconds(3903)).toBe("1h 05m 03s");
    expect(formatIntervalSeconds(9945)).toBe("2h 45m 45s");
  });
});
