import { EmiPlanStatus } from "@/feature/emiLoans/types/emi.entity.types";
import { LedgerEntryType } from "@/feature/ledger/types/ledger.entity.types";
import {
  ReportMenuItem,
  ReportScope,
  type ReportDetailSnapshot,
  type ReportLedgerEntryRecord,
  type ReportQuery,
  type ReportsDatasetSnapshot,
} from "@/feature/reports/types/report.entity.types";
import { REPORT_SEGMENT_COLORS } from "@/feature/reports/types/report.constant";
import {
  buildReportSeriesBucketsForPeriod,
  getReportDateRangeForPeriod,
} from "@/feature/reports/utils/reportPeriod.shared";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import {
  buildAccountStatementGroups,
  buildPartyBalanceGroups,
  buildSeriesForBuckets,
  buildStockRows,
  getTransactionIncomeExpense,
  isWithinRange,
  normalizeReportLabel,
  toSignedBillingDocumentAmount,
} from "./reportReadModel.shared";

export type BuildReportDetailSnapshotParams = {
  query: ReportQuery;
  dataset: ReportsDatasetSnapshot;
  currencyCode: string | null;
  countryCode: string | null;
  nowMs: number;
};

const createCurrencyFormatter = (params: {
  currencyCode: string | null;
  countryCode: string | null;
}) => {
  const formatCurrency = (value: number): string => {
    const absolute = Math.abs(Number.isFinite(value) ? value : 0);

    return formatCurrencyAmount({
      amount: absolute,
      currencyCode: params.currencyCode,
      countryCode: params.countryCode,
      maximumFractionDigits: 0,
    });
  };

  const formatSignedCurrency = (value: number): string => {
    const prefix = value >= 0 ? "" : "-";
    return `${prefix}${formatCurrency(Math.abs(value))}`;
  };

  return { formatCurrency, formatSignedCurrency };
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

const buildDisplayNameCounts = <T extends { displayName: string }>(
  items: readonly T[],
): Map<string, number> => {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const key = item.displayName.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return counts;
};

const resolvePartyGroupLabel = (
  group: {
    displayName: string;
    displayPhone: string | null;
  },
  labelCounts: ReadonlyMap<string, number>,
): string => {
  const duplicateCount = labelCounts.get(group.displayName.toLowerCase()) ?? 0;

  if (duplicateCount > 1 && group.displayPhone) {
    return `${group.displayName} | ${group.displayPhone}`;
  }

  return group.displayName;
};

const isEntryType = (entry: ReportLedgerEntryRecord, entryType: string): boolean => {
  return entry.entryType === entryType;
};

export const buildReportDetailSnapshot = (
  params: BuildReportDetailSnapshotParams,
): ReportDetailSnapshot | null => {
  const { query, dataset, currencyCode, countryCode, nowMs } = params;
  const reportId = query.reportId;

  if (!reportId) {
    return null;
  }

  const { formatCurrency, formatSignedCurrency } = createCurrencyFormatter({
    currencyCode,
    countryCode,
  });

  const range = getReportDateRangeForPeriod(query.period, nowMs);
  const periodBuckets = buildReportSeriesBucketsForPeriod(query.period, nowMs);

  switch (reportId) {
    case ReportMenuItem.Sales: {
      const periodBillingDocuments = dataset.billingDocuments.filter((document) =>
        isWithinRange(document.issuedAt, range.startMs, range.endMs),
      );

      const series = buildSeriesForBuckets(
        periodBuckets,
        (bucketStartMs, bucketEndMs) =>
          dataset.billingDocuments
            .filter((document) =>
              isWithinRange(document.issuedAt, bucketStartMs, bucketEndMs),
            )
            .reduce((sum, document) => sum + toSignedBillingDocumentAmount(document), 0),
      );

      const totalSales = periodBillingDocuments.reduce(
        (sum, document) => sum + toSignedBillingDocumentAmount(document),
        0,
      );

      return {
        reportId,
        title: "Sales Report",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "sales-total",
            label: "Net Sales",
            value: formatCurrency(totalSales),
            tone: totalSales >= 0 ? "positive" : "negative",
          },
          {
            id: "sales-docs",
            label: "Documents",
            value: `${periodBillingDocuments.length}`,
            tone: "neutral",
          },
        ],
        chartTitle: "Sales Trend",
        chartSubtitle: "Net sales for the selected period",
        chartKind: "line",
        lineSeries: series,
      };
    }

    case ReportMenuItem.PartyBalances: {
      const groupedBalances = buildPartyBalanceGroups(dataset.ledgerEntries)
        .map((group) => ({
          ...group,
          outstandingAmount: Math.abs(group.receive - group.pay),
          tone:
            group.receive >= group.pay
              ? ("positive" as const)
              : ("negative" as const),
        }))
        .sort((left, right) => right.outstandingAmount - left.outstandingAmount)
        .slice(0, 6);

      const labelCounts = buildDisplayNameCounts(groupedBalances);

      const items = groupedBalances.map((group) => {
        const label = resolvePartyGroupLabel(group, labelCounts);

        return {
          id: group.id,
          title: label,
          subtitle: `Last activity ${new Date(group.lastAt).toLocaleDateString()}`,
          value: formatCurrency(group.outstandingAmount),
          tone: group.tone,
          progressRatio: null,
        };
      });

      const segments = groupedBalances.map((group, index) => ({
        label: resolvePartyGroupLabel(group, labelCounts),
        value: group.outstandingAmount,
        color: REPORT_SEGMENT_COLORS[index % REPORT_SEGMENT_COLORS.length],
      }));

      const totalOutstanding = groupedBalances.reduce(
        (sum, group) => sum + group.outstandingAmount,
        0,
      );

      return {
        reportId,
        title: "Party Balances",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "open-parties",
            label: "Open Parties",
            value: `${groupedBalances.length}`,
            tone: "neutral",
          },
          {
            id: "total-outstanding",
            label: "Outstanding",
            value: formatCurrency(totalOutstanding),
            tone: "negative",
          },
        ],
        chartTitle: "Outstanding Balances",
        chartSubtitle: "Customer & supplier outstanding",
        chartKind: "semi-donut",
        segments,
        listItems: items,
      };
    }

    case ReportMenuItem.Collection: {
      const bars = buildSeriesForBuckets(
        periodBuckets,
        (bucketStartMs, bucketEndMs) =>
          dataset.ledgerEntries
            .filter(
              (entry) =>
                isEntryType(entry, LedgerEntryType.Collection) &&
                isWithinRange(entry.happenedAt, bucketStartMs, bucketEndMs),
            )
            .reduce((sum, entry) => sum + entry.amount, 0),
      );

      return {
        reportId,
        title: "Collection Report",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "collection-total",
            label: "Total Collected",
            value: formatCurrency(bars.reduce((sum, item) => sum + item.value, 0)),
            tone: "positive",
          },
        ],
        chartTitle: "Collection Trend",
        chartSubtitle: "Trend for the selected period",
        chartKind: "bars",
        barSeries: bars,
      };
    }

    case ReportMenuItem.Payment: {
      const bars = buildSeriesForBuckets(
        periodBuckets,
        (bucketStartMs, bucketEndMs) =>
          dataset.ledgerEntries
            .filter(
              (entry) =>
                isEntryType(entry, LedgerEntryType.PaymentOut) &&
                isWithinRange(entry.happenedAt, bucketStartMs, bucketEndMs),
            )
            .reduce((sum, entry) => sum + entry.amount, 0),
      );

      return {
        reportId,
        title: "Payment Report",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "payment-total",
            label: "Total Paid",
            value: formatCurrency(bars.reduce((sum, item) => sum + item.value, 0)),
            tone: "negative",
          },
        ],
        chartTitle: "Payment Trend",
        chartSubtitle: "Trend for the selected period",
        chartKind: "bars",
        barSeries: bars,
      };
    }

    case ReportMenuItem.CategorySummary: {
      const segments = aggregateCategorySegments(
        dataset.transactions,
        range.startMs,
        range.endMs,
      );

      return {
        reportId,
        title: "Category Summary",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "category-count",
            label: "Categories",
            value: `${segments.length}`,
            tone: "neutral",
          },
          {
            id: "category-total",
            label: "Money Out",
            value: formatCurrency(
              segments.reduce((sum, segment) => sum + segment.value, 0),
            ),
            tone: "negative",
          },
        ],
        chartTitle: "Expense Breakdown",
        chartSubtitle: "Expense by category",
        chartKind: "semi-donut",
        segments,
      };
    }

    case ReportMenuItem.AccountStatement: {
      const filteredTransactions = dataset.transactions.filter((transaction) =>
        isWithinRange(transaction.happenedAt, range.startMs, range.endMs),
      );

      const groupedAccounts = buildAccountStatementGroups({
        transactions: filteredTransactions,
        moneyAccounts: dataset.moneyAccounts,
      });

      const listItems = groupedAccounts.map((group) => ({
        id: group.id,
        title: group.displayName,
        subtitle: `Money In ${formatCurrency(group.totalIn)} | Money Out ${formatCurrency(group.totalOut)}`,
        value: formatSignedCurrency(group.totalIn - group.totalOut),
        tone:
          group.totalIn >= group.totalOut
            ? ("positive" as const)
            : ("negative" as const),
        progressRatio: null,
      }));

      return {
        reportId,
        title: "Account Statement",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "statement-accounts",
            label: "Accounts",
            value: `${groupedAccounts.length}`,
            tone: "neutral",
          },
          {
            id: "statement-entries",
            label: "Entries",
            value: `${filteredTransactions.length}`,
            tone: "neutral",
          },
        ],
        chartTitle: "Account-wise activity",
        chartSubtitle: "Money account-wise transaction history",
        chartKind: "list",
        listItems,
      };
    }

    case ReportMenuItem.EmiLoan: {
      const listItems = dataset.emiPlans
        .filter((plan) => plan.status !== EmiPlanStatus.Closed)
        .map((plan) => ({
          id: plan.title,
          title: plan.title,
          subtitle: plan.nextDueAt
            ? `Next due ${new Date(plan.nextDueAt).toLocaleDateString()}`
            : "No due date",
          value: `${plan.paidInstallmentCount}/${plan.installmentCount}`,
          tone:
            plan.status === EmiPlanStatus.Active
              ? ("positive" as const)
              : ("neutral" as const),
          progressRatio:
            plan.installmentCount > 0
              ? plan.paidInstallmentCount / plan.installmentCount
              : 0,
        }));

      const totalOutstanding = dataset.emiPlans.reduce(
        (sum, plan) => sum + Math.max(plan.totalAmount - plan.paidAmount, 0),
        0,
      );

      return {
        reportId,
        title: "EMI & Loan Report",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "emi-active",
            label: "Active Plans",
            value: `${listItems.length}`,
            tone: "neutral",
          },
          {
            id: "emi-outstanding",
            label: "Outstanding",
            value: formatCurrency(totalOutstanding),
            tone: "negative",
          },
        ],
        chartTitle: "Plan progress",
        chartSubtitle: "Active plans, dues, and exposure",
        chartKind: "progress-list",
        listItems,
      };
    }

    case ReportMenuItem.Stock: {
      const stockRows = buildStockRows({
        products: dataset.products,
        inventoryMovements: dataset.inventoryMovements,
      });

      const listItems = stockRows.map((row) => ({
        id: row.productRemoteId,
        title: row.productName,
        subtitle: `${row.categoryLabel} | ${row.stockQuantity} ${row.unitLabel}`,
        value: formatCurrency(row.valuation),
        tone: row.tone,
        progressRatio: null,
      }));

      const stockValue = stockRows.reduce((sum, row) => sum + row.valuation, 0);

      return {
        reportId,
        title: "Stock Report",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "stock-products",
            label: "Products",
            value: `${stockRows.length}`,
            tone: "neutral",
          },
          {
            id: "stock-value",
            label: "Stock Value",
            value: formatCurrency(stockValue),
            tone: "positive",
          },
        ],
        chartTitle: "Current stock & valuation",
        chartSubtitle: "Inventory movement based stock position",
        chartKind: "list",
        listItems,
      };
    }

    case ReportMenuItem.ExportData: {
      const topSummary = getTransactionIncomeExpense(
        dataset.transactions,
        range.startMs,
        range.endMs,
      );

      const rows = [
        { label: "Period", value: range.label },
        { label: "Money In", value: String(topSummary.totalIncome) },
        { label: "Money Out", value: String(topSummary.totalExpense) },
        {
          label: "Net",
          value: String(topSummary.totalIncome - topSummary.totalExpense),
        },
        { label: "Transactions", value: String(dataset.transactions.length) },
        { label: "BillingDocs", value: String(dataset.billingDocuments.length) },
        { label: "LedgerEntries", value: String(dataset.ledgerEntries.length) },
      ];

      return {
        reportId,
        title: "Export Data",
        periodLabel: range.label,
        summaryCards: [
          {
            id: "export-scope",
            label: "Scope",
            value:
              query.scope === ReportScope.Business ? "Business" : "Personal",
            tone: "neutral",
          },
          {
            id: "export-rows",
            label: "Rows",
            value: `${rows.length}`,
            tone: "neutral",
          },
        ],
        chartTitle: "Export Preview",
        chartSubtitle: "Same filtered query model used for exports",
        chartKind: "export-preview",
        listItems: rows.map((row, index) => ({
          id: `export-row-${index + 1}`,
          title: row.label,
          subtitle: "",
          value: row.value,
          tone: "neutral",
        })),
      };
    }

    default:
      return null;
  }
};
