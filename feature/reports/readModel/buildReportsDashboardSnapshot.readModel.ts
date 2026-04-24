import type {
  ReportMenuSection,
  ReportQuery,
  ReportsDashboardSnapshot,
  ReportsDatasetSnapshot,
} from "@/feature/reports/types/report.entity.types";
import { ReportMenuItem, ReportScope } from "@/feature/reports/types/report.entity.types";
import { REPORT_SEGMENT_COLORS } from "@/feature/reports/types/report.constant";
import {
  buildDualSeriesForBuckets,
  buildSeriesForBuckets,
  getTransactionIncomeExpense,
  isWithinRange,
  normalizeReportLabel,
} from "./reportReadModel.shared";
import {
  buildReportSeriesBucketsForPeriod,
  getReportDateRangeForPeriod,
} from "@/feature/reports/utils/reportPeriod.shared";

export type BuildReportsDashboardSnapshotParams = {
  query: ReportQuery;
  dataset: ReportsDatasetSnapshot;
  currencyCode: string | null;
  countryCode: string | null;
  nowMs: number;
};

const buildSections = (scope: string): ReportMenuSection[] => {
  if (scope === ReportScope.Personal) {
    return [
      {
        id: "financial",
        title: "Financial Reports",
        items: [
          {
            id: ReportMenuItem.CategorySummary,
            title: "Category Summary",
            subtitle: "Expense by category",
          },
          {
            id: ReportMenuItem.AccountStatement,
            title: "Account Statement",
            subtitle: "Account-wise transaction history",
          },
          {
            id: ReportMenuItem.EmiLoan,
            title: "EMI & Loan Report",
            subtitle: "Active plans and dues",
          },
        ],
      },
    ];
  }

  return [
    {
      id: "business",
      title: "Business Reports",
      items: [
        {
          id: ReportMenuItem.Sales,
          title: "Sales Report",
          subtitle: "Daily, weekly, monthly sales summary",
        },
        {
          id: ReportMenuItem.PartyBalances,
          title: "Party Balances",
          subtitle: "Customer & supplier outstanding",
        },
        {
          id: ReportMenuItem.Collection,
          title: "Collection Report",
          subtitle: "Payment received history",
        },
        {
          id: ReportMenuItem.Payment,
          title: "Payment Report",
          subtitle: "Payment made history",
        },
      ],
    },
    {
      id: "financial",
      title: "Financial Reports",
      items: [
        {
          id: ReportMenuItem.CategorySummary,
          title: "Category Summary",
          subtitle: "Expense by category",
        },
        {
          id: ReportMenuItem.AccountStatement,
          title: "Account Statement",
          subtitle: "Account-wise transaction history",
        },
        {
          id: ReportMenuItem.EmiLoan,
          title: "EMI & Loan Report",
          subtitle: "Active plans, dues, penalties",
        },
      ],
    },
    {
      id: "inventory",
      title: "Inventory Reports",
      items: [
        {
          id: ReportMenuItem.Stock,
          title: "Stock Report",
          subtitle: "Current stock & valuation",
        },
        {
          id: ReportMenuItem.ExportData,
          title: "Export Data",
          subtitle: "Export reports as CSV / PDF",
        },
      ],
    },
  ];
};

const aggregateCategorySegments = (
  transactions: ReportsDatasetSnapshot["transactions"],
  startMs: number,
  endMs: number,
) => {
  const grouped = new Map<
    string,
    {
      label: string;
      value: number;
    }
  >();

  transactions.forEach((transaction) => {
    if (!isWithinRange(transaction.happenedAt, startMs, endMs)) {
      return;
    }

    if (transaction.direction !== "out") {
      return;
    }

    const label = normalizeReportLabel(transaction.categoryLabel) ?? "Others";
    const key = `category:label:${label.toLowerCase()}`;
    const current = grouped.get(key) ?? { label, value: 0 };

    current.value += transaction.amount;
    grouped.set(key, current);
  });

  return [...grouped.values()]
    .sort((left, right) => right.value - left.value)
    .slice(0, 5)
    .map((item, index) => ({
      label: item.label,
      value: item.value,
      color: REPORT_SEGMENT_COLORS[index % REPORT_SEGMENT_COLORS.length],
    }));
};

export const buildReportsDashboardSnapshot = (
  params: BuildReportsDashboardSnapshotParams,
): ReportsDashboardSnapshot => {
  const { query, dataset, currencyCode, countryCode, nowMs } = params;

  const range = getReportDateRangeForPeriod(query.period, nowMs);
  const periodBuckets = buildReportSeriesBucketsForPeriod(query.period, nowMs);

  const topSummary = getTransactionIncomeExpense(
    dataset.transactions,
    range.startMs,
    range.endMs,
  );

  const overviewTrend = buildSeriesForBuckets(
    periodBuckets,
    (bucketStartMs, bucketEndMs) => {
      const bucketSummary = getTransactionIncomeExpense(
        dataset.transactions,
        bucketStartMs,
        bucketEndMs,
      );

      return bucketSummary.totalIncome - bucketSummary.totalExpense;
    },
  );

  const incomeExpenseComparison = buildDualSeriesForBuckets(
    periodBuckets,
    (bucketStartMs, bucketEndMs) =>
      getTransactionIncomeExpense(
        dataset.transactions,
        bucketStartMs,
        bucketEndMs,
      ).totalIncome,
    (bucketStartMs, bucketEndMs) =>
      getTransactionIncomeExpense(
        dataset.transactions,
        bucketStartMs,
        bucketEndMs,
      ).totalExpense,
  );

  const cashFlowSeries = buildDualSeriesForBuckets(
    periodBuckets,
    (bucketStartMs, bucketEndMs) =>
      getTransactionIncomeExpense(
        dataset.transactions,
        bucketStartMs,
        bucketEndMs,
      ).totalIncome,
    (bucketStartMs, bucketEndMs) =>
      getTransactionIncomeExpense(
        dataset.transactions,
        bucketStartMs,
        bucketEndMs,
      ).totalExpense,
  );

  const categoryBreakdown = aggregateCategorySegments(
    dataset.transactions,
    range.startMs,
    range.endMs,
  );

  return {
    scope: query.scope,
    currencyCode,
    countryCode,
    periodLabel: range.label,
    topSummary: {
      totalIncome: topSummary.totalIncome,
      totalExpense: topSummary.totalExpense,
      netCashFlow: topSummary.totalIncome - topSummary.totalExpense,
    },
    overviewTrend,
    incomeExpenseComparison,
    categoryBreakdown,
    cashFlowSeries,
    sections: buildSections(query.scope),
  };
};
