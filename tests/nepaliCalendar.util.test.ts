import {
  adDateStringToBsDateString,
  bsDateStringToAdDateString,
  formatDualCalendarDateLabel,
  getBsDaysInMonth,
  isValidAdDateString,
} from "@/shared/utils/date/nepaliCalendar";
import { describe, expect, it } from "vitest";

describe("nepali calendar date utilities", () => {
  it("converts English AD dates to Nepali BS dates", () => {
    expect(adDateStringToBsDateString("2026-04-25")).toBe("2083-01-12");
  });

  it("converts Nepali BS dates back to English AD dates", () => {
    expect(bsDateStringToAdDateString("2083-01-12")).toBe("2026-04-25");
  });

  it("rejects invalid English AD dates", () => {
    expect(isValidAdDateString("2026-02-30")).toBe(false);
    expect(adDateStringToBsDateString("2026-02-30")).toBeNull();
  });

  it("rejects invalid Nepali BS dates", () => {
    const daysInBaisakh = getBsDaysInMonth(2083, 1);

    expect(daysInBaisakh).toBe(31);
    expect(bsDateStringToAdDateString("2083-01-32")).toBeNull();
  });

  it("formats the selected date with both AD and BS labels", () => {
    expect(formatDualCalendarDateLabel("2026-04-25")).toBe(
      "2026-04-25 AD / 2083-01-12 BS",
    );
  });
});
