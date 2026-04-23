import {
  ReportMenuItem,
  ReportPeriod,
} from "@/feature/reports/types/report.entity.types";
import {
  buildReportSeriesBucketsForPeriod,
  isReportPeriodFilterable,
} from "@/feature/reports/utils/reportPeriod.shared";
import { describe, expect, it } from "vitest";

const FIXED_NOW = new Date(2026, 3, 23, 10, 30, 0, 0).getTime();

describe("reportPeriod.shared", () => {
  it("marks only period-driven reports as filterable", () => {
    expect(isReportPeriodFilterable(ReportMenuItem.Sales)).toBe(true);
    expect(isReportPeriodFilterable(ReportMenuItem.Collection)).toBe(true);
    expect(isReportPeriodFilterable(ReportMenuItem.Payment)).toBe(true);
    expect(isReportPeriodFilterable(ReportMenuItem.CategorySummary)).toBe(true);
    expect(isReportPeriodFilterable(ReportMenuItem.AccountStatement)).toBe(true);
    expect(isReportPeriodFilterable(ReportMenuItem.ExportData)).toBe(true);

    expect(isReportPeriodFilterable(ReportMenuItem.PartyBalances)).toBe(false);
    expect(isReportPeriodFilterable(ReportMenuItem.EmiLoan)).toBe(false);
    expect(isReportPeriodFilterable(ReportMenuItem.Stock)).toBe(false);
    expect(isReportPeriodFilterable(null)).toBe(false);
  });

  it("builds weekday buckets for this week and monthly buckets for the last six months", () => {
    const weeklyBuckets = buildReportSeriesBucketsForPeriod(
      ReportPeriod.ThisWeek,
      FIXED_NOW,
    );
    expect(weeklyBuckets).toHaveLength(7);
    expect(weeklyBuckets.map((bucket) => bucket.label)).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);

    const lastSixMonthBuckets = buildReportSeriesBucketsForPeriod(
      ReportPeriod.LastSixMonths,
      FIXED_NOW,
    );
    expect(lastSixMonthBuckets).toHaveLength(6);
    expect(lastSixMonthBuckets.map((bucket) => bucket.label)).toEqual([
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
    ]);
  });
});
