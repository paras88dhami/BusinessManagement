import { EmiPlanStatus } from "@/feature/emiLoans/types/emi.entity.types";
import { LedgerBalanceDirection, LedgerEntryType } from "@/feature/ledger/types/ledger.entity.types";
import { BillingDocumentType } from "@/feature/billing/types/billing.types";
import { ReportsDatasource } from "@/feature/reports/data/dataSource/reports.datasource";
import { colors } from "@/shared/components/theme/colors";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import {
    ReportDetailResult,
    ReportDualSeriesPoint,
    ReportMenuItem,
    ReportMenuSection,
    ReportQuery,
    ReportScope,
    ReportsDashboardResult,
    ReportSegment,
    ReportSeriesPoint
} from "../../types/report.entity.types";
import {
    ReportDatabaseError,
    ReportNotFoundError,
    ReportUnknownError,
    ReportValidationError,
} from "../../types/report.error.types";
import {
    buildReportSeriesBucketsForPeriod,
    getReportDateRangeForPeriod,
} from "../../utils/reportPeriod.shared";
import {
  BillingDocumentRecord,
  LedgerEntryRecord,
  MoneyAccountRecord,
  TransactionRecord,
  mapBillingDocumentModel,
  mapEmiPlanModel,
  mapInventoryMovementModel,
  mapLedgerEntryModel,
  mapMoneyAccountModel,
  mapProductModel,
  mapTransactionModel,
} from "./mapper/reports.mapper";
import { ReportsRepository } from "./reports.repository";

const CATEGORY_COLORS = [
  colors.success,
  colors.primary,
  colors.warning,
  colors.destructive,
  colors.mutedForeground,
  "#6A8F7B",
] as const;

type CreateReportsRepositoryOptions = {
  currencyCode: string | null;
  countryCode: string | null;
};

const createCurrencyFormatter = (options: CreateReportsRepositoryOptions) => {
  const formatCurrency = (value: number): string => {
    const absolute = Math.abs(Number.isFinite(value) ? value : 0);

    return formatCurrencyAmount({
      amount: absolute,
      currencyCode: options.currencyCode,
      countryCode: options.countryCode,
      maximumFractionDigits: 0,
    });
  };

  const formatSignedCurrency = (value: number): string => {
    const prefix = value >= 0 ? "" : "-";
    return `${prefix}${formatCurrency(Math.abs(value))}`;
  };

  return { formatCurrency, formatSignedCurrency };
};

const isWithinRange = (value: number, startMs: number, endMs: number): boolean => {
  return value >= startMs && value <= endMs;
};

const buildSeriesForBuckets = (
  buckets: readonly { label: string; startMs: number; endMs: number }[],
  valueBuilder: (startMs: number, endMs: number) => number,
): ReportSeriesPoint[] => {
  return buckets.map((bucket) => ({
    label: bucket.label,
    value: valueBuilder(bucket.startMs, bucket.endMs),
  }));
};

const buildDualSeriesForBuckets = (
  buckets: readonly { label: string; startMs: number; endMs: number }[],
  primaryBuilder: (startMs: number, endMs: number) => number,
  secondaryBuilder: (startMs: number, endMs: number) => number,
): ReportDualSeriesPoint[] => {
  return buckets.map((bucket) => ({
    label: bucket.label,
    primaryValue: primaryBuilder(bucket.startMs, bucket.endMs),
    secondaryValue: secondaryBuilder(bucket.startMs, bucket.endMs),
  }));
};

const aggregateCategorySegments = (
  transactions: readonly TransactionRecord[],
  startMs: number,
  endMs: number,
): ReportSegment[] => {
  const grouped = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (!isWithinRange(transaction.happenedAt, startMs, endMs)) {
      return;
    }

    if (transaction.direction !== "out") {
      return;
    }

    const key = transaction.categoryLabel?.trim() || "Others";
    grouped.set(key, (grouped.get(key) ?? 0) + transaction.amount);
  });

  return [...grouped.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
};

const getTransactionIncomeExpense = (
  transactions: readonly TransactionRecord[],
  startMs: number,
  endMs: number,
) => {
  const totalIncome = transactions
    .filter(
      (item) => item.direction === "in" && isWithinRange(item.happenedAt, startMs, endMs),
    )
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter(
      (item) => item.direction === "out" && isWithinRange(item.happenedAt, startMs, endMs),
    )
    .reduce((sum, item) => sum + item.amount, 0);

  return { totalIncome, totalExpense };
};

const toSignedBillingDocumentAmount = (document: BillingDocumentRecord): number => {
  return document.documentType === BillingDocumentType.CreditNote
    ? -document.totalAmount
    : document.totalAmount;
};

type StockRow = {
  productRemoteId: string;
  productName: string;
  categoryLabel: string;
  unitLabel: string;
  stockQuantity: number;
  valuation: number;
  tone: "positive" | "negative";
};

const buildStockRows = (params: {
  products: readonly import("./mapper/reports.mapper").ProductRecord[];
  inventoryMovements: readonly import("./mapper/reports.mapper").InventoryMovementRecord[];
}): StockRow[] => {
  const movementMap = new Map<
    string,
    {
      productName: string;
      unitLabel: string;
      quantity: number;
      latestUnitRate: number | null;
      lastMovementAt: number;
    }
  >();

  params.inventoryMovements.forEach((movement) => {
    const current = movementMap.get(movement.productRemoteId) ?? {
      productName: movement.productNameSnapshot,
      unitLabel: movement.productUnitLabelSnapshot ?? "units",
      quantity: 0,
      latestUnitRate: null,
      lastMovementAt: 0,
    };

    current.quantity += movement.deltaQuantity;

    if (movement.movementAt >= current.lastMovementAt) {
      current.productName = movement.productNameSnapshot;
      current.unitLabel = movement.productUnitLabelSnapshot ?? current.unitLabel;
      current.latestUnitRate = movement.unitRate ?? current.latestUnitRate;
      current.lastMovementAt = movement.movementAt;
    }

    movementMap.set(movement.productRemoteId, current);
  });

  const consumedMovementIds = new Set<string>();

  const productRows: StockRow[] = params.products.map((product) => {
    const movementAggregate = movementMap.get(product.remoteId);
    consumedMovementIds.add(product.remoteId);

    const stockQuantity = movementAggregate?.quantity ?? 0;
    const unitRate =
      product.costPrice ?? movementAggregate?.latestUnitRate ?? product.salePrice ?? 0;

    return {
      productRemoteId: product.remoteId,
      productName: product.name,
      categoryLabel: product.categoryName ?? "General",
      unitLabel: product.unitLabel ?? movementAggregate?.unitLabel ?? "units",
      stockQuantity,
      valuation: stockQuantity * unitRate,
      tone: stockQuantity <= 5 ? "negative" : "positive",
    };
  });

  const orphanMovementRows: StockRow[] = [...movementMap.entries()]
    .filter(([productRemoteId]) => !consumedMovementIds.has(productRemoteId))
    .map(([productRemoteId, aggregate]) => ({
      productRemoteId,
      productName: aggregate.productName,
      categoryLabel: "General",
      unitLabel: aggregate.unitLabel,
      stockQuantity: aggregate.quantity,
      valuation: aggregate.quantity * (aggregate.latestUnitRate ?? 0),
      tone: aggregate.quantity <= 5 ? "negative" : "positive",
    }));

  return [...productRows, ...orphanMovementRows].sort((left, right) => {
    if (right.valuation !== left.valuation) {
      return right.valuation - left.valuation;
    }
    return left.productName.localeCompare(right.productName);
  });
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
            subtitle: "Income & expense by category",
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
          subtitle: "Income & expense by category",
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

const normalizeReportLabel = (
  value: string | null | undefined,
): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeReportKeyPart = (
  value: string | null | undefined,
): string => {
  return normalizeReportLabel(value)?.toLowerCase() ?? "";
};

type PartyBalanceGroup = {
  id: string;
  displayName: string;
  displayPhone: string | null;
  receive: number;
  pay: number;
  lastAt: number;
};

type AccountStatementGroup = {
  id: string;
  displayName: string;
  totalIn: number;
  totalOut: number;
  lastAt: number;
};

const resolvePartyGroupDisplayName = (
  entry: LedgerEntryRecord,
): string => {
  return (
    normalizeReportLabel(entry.partyName) ??
    normalizeReportLabel(entry.partyPhone) ??
    "Unknown Party"
  );
};

const buildPartyBalanceGroupId = (
  entry: LedgerEntryRecord,
): string => {
  const contactRemoteId = normalizeReportLabel(entry.contactRemoteId);
  if (contactRemoteId) {
    return `contact:${contactRemoteId}`;
  }

  const partyNameKey = normalizeReportKeyPart(entry.partyName) || "unknown";
  const partyPhoneKey =
    normalizeReportKeyPart(entry.partyPhone) || "no-phone";

  return `unlinked:${partyNameKey}:${partyPhoneKey}`;
};

const buildPartyBalanceGroups = (
  ledgerEntries: readonly LedgerEntryRecord[],
): PartyBalanceGroup[] => {
  const grouped = new Map<string, PartyBalanceGroup>();

  ledgerEntries.forEach((entry) => {
    const groupId = buildPartyBalanceGroupId(entry);
    const current = grouped.get(groupId) ?? {
      id: groupId,
      displayName: resolvePartyGroupDisplayName(entry),
      displayPhone: normalizeReportLabel(entry.partyPhone),
      receive: 0,
      pay: 0,
      lastAt: 0,
    };

    if (entry.balanceDirection === LedgerBalanceDirection.Receive) {
      current.receive += entry.amount;
    } else {
      current.pay += entry.amount;
    }

    if (entry.happenedAt >= current.lastAt) {
      current.lastAt = entry.happenedAt;
      current.displayName = resolvePartyGroupDisplayName(entry);
      current.displayPhone = normalizeReportLabel(entry.partyPhone);
    }

    grouped.set(groupId, current);
  });

  return [...grouped.values()];
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
  group: Pick<PartyBalanceGroup, "displayName" | "displayPhone">,
  labelCounts: ReadonlyMap<string, number>,
): string => {
  const duplicateCount =
    labelCounts.get(group.displayName.toLowerCase()) ?? 0;

  if (duplicateCount > 1 && group.displayPhone) {
    return `${group.displayName} • ${group.displayPhone}`;
  }

  return group.displayName;
};

const buildMoneyAccountNameMap = (
  moneyAccounts: readonly MoneyAccountRecord[],
): Map<string, string> => {
  const map = new Map<string, string>();

  moneyAccounts.forEach((account) => {
    const remoteId = normalizeReportLabel(account.remoteId);
    const name = normalizeReportLabel(account.name);

    if (!remoteId || !name) {
      return;
    }

    map.set(remoteId, name);
  });

  return map;
};

const buildAccountStatementGroupId = (
  transaction: TransactionRecord,
): string => {
  const settlementMoneyAccountRemoteId = normalizeReportLabel(
    transaction.settlementMoneyAccountRemoteId,
  );
  if (settlementMoneyAccountRemoteId) {
    return `money_account:${settlementMoneyAccountRemoteId}`;
  }

  const snapshotLabel = normalizeReportLabel(
    transaction.settlementMoneyAccountDisplayNameSnapshot,
  );
  if (snapshotLabel) {
    return `snapshot:${snapshotLabel.toLowerCase()}`;
  }

  return "unassigned";
};

const resolveAccountStatementDisplayName = (params: {
  transaction: TransactionRecord;
  moneyAccountNameMap: ReadonlyMap<string, string>;
}): string => {
  const settlementMoneyAccountRemoteId = normalizeReportLabel(
    params.transaction.settlementMoneyAccountRemoteId,
  );

  if (settlementMoneyAccountRemoteId) {
    return (
      params.moneyAccountNameMap.get(settlementMoneyAccountRemoteId) ??
      normalizeReportLabel(
        params.transaction.settlementMoneyAccountDisplayNameSnapshot,
      ) ??
      "Unknown Account"
    );
  }

  return (
    normalizeReportLabel(
      params.transaction.settlementMoneyAccountDisplayNameSnapshot,
    ) ?? "Unassigned Account"
  );
};

const buildAccountStatementGroups = (params: {
  transactions: readonly TransactionRecord[];
  moneyAccounts: readonly MoneyAccountRecord[];
}): AccountStatementGroup[] => {
  const moneyAccountNameMap = buildMoneyAccountNameMap(params.moneyAccounts);
  const grouped = new Map<string, AccountStatementGroup>();

  params.transactions.forEach((transaction) => {
    const groupId = buildAccountStatementGroupId(transaction);
    const current = grouped.get(groupId) ?? {
      id: groupId,
      displayName: resolveAccountStatementDisplayName({
        transaction,
        moneyAccountNameMap,
      }),
      totalIn: 0,
      totalOut: 0,
      lastAt: 0,
    };

    if (transaction.direction === "in") {
      current.totalIn += transaction.amount;
    } else {
      current.totalOut += transaction.amount;
    }

    current.lastAt = Math.max(current.lastAt, transaction.happenedAt);
    current.displayName = resolveAccountStatementDisplayName({
      transaction,
      moneyAccountNameMap,
    });

    grouped.set(groupId, current);
  });

  return [...grouped.values()].sort((left, right) => {
    const rightActivity = right.totalIn + right.totalOut;
    const leftActivity = left.totalIn + left.totalOut;

    if (rightActivity !== leftActivity) {
      return rightActivity - leftActivity;
    }

    return left.displayName.localeCompare(right.displayName);
  });
};

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value).replace(/\r?\n/g, "\\n");
  if (
    normalized.includes(",") ||
    normalized.includes("\"") ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }

  return normalized;
};

const toCsvLine = (values: readonly unknown[]): string => {
  return values.map((value) => escapeCsvValue(value)).join(",");
};

const buildCsvContent = (
  rows: readonly { label: string; value: string }[],
): string => {
  return [
    toCsvLine(["label", "value"]),
    ...rows.map((row) => toCsvLine([row.label, row.value])),
  ].join("\n");
};

const buildReportCsvFileName = (query: ReportQuery): string => {
  const scopePart =
    query.scope === ReportScope.Business ? "business" : "personal";

  return `report_export_${scopePart}_${query.period}.csv`;
};

export const createReportsRepository = (
  datasource: ReportsDatasource,
  options: CreateReportsRepositoryOptions,
): ReportsRepository => {
  const { formatCurrency, formatSignedCurrency } = createCurrencyFormatter(options);

  return {
    async getReportsDashboard(query: ReportQuery): Promise<ReportsDashboardResult> {
      if (!query.accountRemoteId && !query.ownerUserRemoteId) {
        return {
          success: false,
          error: ReportValidationError("Active report scope is missing."),
        };
      }

      try {
        const datasetResult = await datasource.getDataset(query);
        if (!datasetResult.success) {
          return { success: false, error: ReportDatabaseError };
        }

        const nowMs = Date.now();
        const range = getReportDateRangeForPeriod(query.period, nowMs);
        const periodBuckets = buildReportSeriesBucketsForPeriod(query.period, nowMs);

        const transactions = datasetResult.value.transactions.map(mapTransactionModel);

        const topSummary = getTransactionIncomeExpense(
          transactions,
          range.startMs,
          range.endMs,
        );

        const overviewTrend = buildSeriesForBuckets(
          periodBuckets,
          (bucketStartMs, bucketEndMs) => {
            const bucketSummary = getTransactionIncomeExpense(
              transactions,
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
              transactions,
              bucketStartMs,
              bucketEndMs,
            ).totalIncome,
          (bucketStartMs, bucketEndMs) =>
            getTransactionIncomeExpense(
              transactions,
              bucketStartMs,
              bucketEndMs,
            ).totalExpense,
        );

        const cashFlowSeries = buildDualSeriesForBuckets(
          periodBuckets,
          (bucketStartMs, bucketEndMs) =>
            getTransactionIncomeExpense(
              transactions,
              bucketStartMs,
              bucketEndMs,
            ).totalIncome,
          (bucketStartMs, bucketEndMs) =>
            getTransactionIncomeExpense(
              transactions,
              bucketStartMs,
              bucketEndMs,
            ).totalExpense,
        );

        const categoryBreakdown = aggregateCategorySegments(
          transactions,
          range.startMs,
          range.endMs,
        );

        return {
          success: true,
          value: {
            scope: query.scope,
            currencyCode: options.currencyCode,
            countryCode: options.countryCode,
            periodLabel: range.label,
            topSummary: {
              totalIncome: topSummary.totalIncome,
              totalExpense: topSummary.totalExpense,
              netProfit: topSummary.totalIncome - topSummary.totalExpense,
            },
            overviewTrend,
            incomeExpenseComparison,
            categoryBreakdown,
            cashFlowSeries,
            sections: buildSections(query.scope),
          },
        };
      } catch {
        return { success: false, error: ReportUnknownError };
      }
    },

    async getReportDetail(query: ReportQuery): Promise<ReportDetailResult> {
    if (!query.reportId) {
      return { success: false, error: ReportValidationError("Report id is required.") };
    }

    try {
      const datasetResult = await datasource.getDataset(query);
      if (!datasetResult.success) {
        return { success: false, error: ReportDatabaseError };
      }

      const nowMs = Date.now();
      const range = getReportDateRangeForPeriod(query.period, nowMs);
      const periodBuckets = buildReportSeriesBucketsForPeriod(query.period, nowMs);
      const transactions = datasetResult.value.transactions.map(mapTransactionModel);
      const billingDocuments = datasetResult.value.billingDocuments.map(mapBillingDocumentModel);
      const ledgerEntries = datasetResult.value.ledgerEntries.map(mapLedgerEntryModel);
      const emiPlans = datasetResult.value.emiPlans.map(mapEmiPlanModel);
      const inventoryMovements = datasetResult.value.inventoryMovements.map(mapInventoryMovementModel);
      const products = datasetResult.value.products.map(mapProductModel);
      const moneyAccounts = datasetResult.value.moneyAccounts.map(mapMoneyAccountModel);

      switch (query.reportId) {
        case ReportMenuItem.Sales: {
          const periodBillingDocuments = billingDocuments.filter((document) =>
            isWithinRange(document.issuedAt, range.startMs, range.endMs),
          );

          const series = buildSeriesForBuckets(
            periodBuckets,
            (bucketStartMs, bucketEndMs) =>
              billingDocuments
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
            success: true,
            value: {
              reportId: query.reportId,
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
            },
          };
        }
        case ReportMenuItem.PartyBalances: {
          const groupedBalances = buildPartyBalanceGroups(ledgerEntries)
            .map((group) => ({
              ...group,
              outstandingAmount: Math.abs(group.receive - group.pay),
              tone:
                group.receive >= group.pay
                  ? ("positive" as const)
                  : ("negative" as const),
            }))
            .sort(
              (left, right) => right.outstandingAmount - left.outstandingAmount,
            )
            .slice(0, 6);

          const labelCounts = buildDisplayNameCounts(groupedBalances);

          const items = groupedBalances.map((group) => {
            const label = resolvePartyGroupLabel(group, labelCounts);

            return {
              id: group.id,
              title: label,
              subtitle: `Last activity ${new Date(
                group.lastAt,
              ).toLocaleDateString()}`,
              value: formatCurrency(group.outstandingAmount),
              tone: group.tone,
              progressRatio: null,
            };
          });

          const segments = groupedBalances.map((group, index) => ({
            label: resolvePartyGroupLabel(group, labelCounts),
            value: group.outstandingAmount,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          }));

          const totalOutstanding = groupedBalances.reduce(
            (sum, group) => sum + group.outstandingAmount,
            0,
          );

          return {
            success: true,
            value: {
              reportId: query.reportId,
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
            },
          };
        }
        case ReportMenuItem.Collection: {
          const bars = buildSeriesForBuckets(
            periodBuckets,
            (bucketStartMs, bucketEndMs) =>
              ledgerEntries
                .filter(
                  (entry) =>
                    entry.entryType === LedgerEntryType.Collection &&
                    isWithinRange(entry.happenedAt, bucketStartMs, bucketEndMs),
                )
                .reduce((sum, entry) => sum + entry.amount, 0),
          );

          return {
            success: true,
            value: {
              reportId: query.reportId,
              title: "Collection Report",
              periodLabel: range.label,
              summaryCards: [
                {
                  id: "collection-total",
                  label: "Total Collected",
                  value: formatCurrency(
                    bars.reduce((sum, item) => sum + item.value, 0),
                  ),
                  tone: "positive",
                },
              ],
              chartTitle: "Collection Trend",
              chartSubtitle: "Trend for the selected period",
              chartKind: "bars",
              barSeries: bars,
            },
          };
        }
        case ReportMenuItem.Payment: {
          const bars = buildSeriesForBuckets(
            periodBuckets,
            (bucketStartMs, bucketEndMs) =>
              ledgerEntries
                .filter(
                  (entry) =>
                    entry.entryType === LedgerEntryType.PaymentOut &&
                    isWithinRange(entry.happenedAt, bucketStartMs, bucketEndMs),
                )
                .reduce((sum, entry) => sum + entry.amount, 0),
          );

          return {
            success: true,
            value: {
              reportId: query.reportId,
              title: "Payment Report",
              periodLabel: range.label,
              summaryCards: [
                {
                  id: "payment-total",
                  label: "Total Paid",
                  value: formatCurrency(
                    bars.reduce((sum, item) => sum + item.value, 0),
                  ),
                  tone: "negative",
                },
              ],
              chartTitle: "Payment Trend",
              chartSubtitle: "Trend for the selected period",
              chartKind: "bars",
              barSeries: bars,
            },
          };
        }
        case ReportMenuItem.CategorySummary: {
          const segments = aggregateCategorySegments(transactions, range.startMs, range.endMs);
          return {
            success: true,
            value: {
              reportId: query.reportId,
              title: "Category Summary",
              periodLabel: range.label,
              summaryCards: [
                { id: "category-count", label: "Categories", value: `${segments.length}`, tone: "neutral" },
                { id: "category-total", label: "Money Out", value: formatCurrency(segments.reduce((sum, item) => sum + item.value, 0)), tone: "negative" },
              ],
              chartTitle: "Expense Breakdown",
              chartSubtitle: "Income & expense by category",
              chartKind: "semi-donut",
              segments,
            },
          };
        }
        case ReportMenuItem.AccountStatement: {
          const filteredTransactions = transactions.filter((item) =>
            isWithinRange(item.happenedAt, range.startMs, range.endMs),
          );

          const groupedAccounts = buildAccountStatementGroups({
            transactions: filteredTransactions,
            moneyAccounts,
          });

          const listItems = groupedAccounts.map((group) => ({
            id: group.id,
            title: group.displayName,
            subtitle: `Money In ${formatCurrency(
              group.totalIn,
            )} | Money Out ${formatCurrency(group.totalOut)}`,
            value: formatSignedCurrency(group.totalIn - group.totalOut),
            tone:
              group.totalIn >= group.totalOut
                ? ("positive" as const)
                : ("negative" as const),
            progressRatio: null,
          }));

          return {
            success: true,
            value: {
              reportId: query.reportId,
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
            },
          };
        }
        case ReportMenuItem.EmiLoan: {
          const listItems = emiPlans
            .filter((plan) => plan.status !== EmiPlanStatus.Closed)
            .map((plan) => ({
              id: plan.title,
              title: plan.title,
              subtitle: plan.nextDueAt ? `Next due ${new Date(plan.nextDueAt).toLocaleDateString()}` : "No due date",
              value: `${plan.paidInstallmentCount}/${plan.installmentCount}`,
              tone: plan.status === EmiPlanStatus.Active ? ("positive" as const) : ("neutral" as const),
              progressRatio: plan.installmentCount > 0 ? plan.paidInstallmentCount / plan.installmentCount : 0,
            }));
          const totalOutstanding = emiPlans.reduce((sum, plan) => sum + Math.max(plan.totalAmount - plan.paidAmount, 0), 0);
          return {
            success: true,
            value: {
              reportId: query.reportId,
              title: "EMI & Loan Report",
              periodLabel: range.label,
              summaryCards: [
                { id: "emi-active", label: "Active Plans", value: `${listItems.length}`, tone: "neutral" },
                { id: "emi-outstanding", label: "Outstanding", value: formatCurrency(totalOutstanding), tone: "negative" },
              ],
              chartTitle: "Plan progress",
              chartSubtitle: "Active plans, dues, and exposure",
              chartKind: "progress-list",
              listItems,
            },
          };
        }
        case ReportMenuItem.Stock: {
          const stockRows = buildStockRows({
            products,
            inventoryMovements,
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
            success: true,
            value: {
              reportId: query.reportId,
              title: "Stock Report",
              periodLabel: range.label,
              summaryCards: [
                { id: "stock-products", label: "Products", value: `${stockRows.length}`, tone: "neutral" },
                { id: "stock-value", label: "Stock Value", value: formatCurrency(stockValue), tone: "positive" },
              ],
              chartTitle: "Current stock & valuation",
              chartSubtitle: "Inventory movement based stock position",
              chartKind: "list",
              listItems,
            },
          };
        }
        case ReportMenuItem.ExportData: {
          const topSummary = getTransactionIncomeExpense(
            transactions,
            range.startMs,
            range.endMs,
          );

          const rows = [
            { label: "Period", value: range.label },
            { label: "Money In", value: String(topSummary.totalIncome) },
            { label: "Money Out", value: String(topSummary.totalExpense) },
            { label: "Net", value: String(topSummary.totalIncome - topSummary.totalExpense) },
            { label: "Transactions", value: String(transactions.length) },
            { label: "BillingDocs", value: String(billingDocuments.length) },
            { label: "LedgerEntries", value: String(ledgerEntries.length) },
          ];

          const csvContent = buildCsvContent(rows);

          return {
            success: true,
            value: {
              reportId: query.reportId,
              title: "Export Data",
              periodLabel: range.label,
              summaryCards: [
                { id: "export-scope", label: "Scope", value: query.scope === ReportScope.Business ? "Business" : "Personal", tone: "neutral" },
                { id: "export-rows", label: "Rows", value: `${rows.length}`, tone: "neutral" },
              ],
              chartTitle: "Export Preview",
              chartSubtitle: "Same filtered query model used for exports",
              chartKind: "export-preview",
              csvPreview: csvContent,
              csvExport: {
                fileName: buildReportCsvFileName(query),
                content: csvContent,
                mimeType: "text/csv",
              },
            },
          };
        }
        default:
          return { success: false, error: ReportNotFoundError };
      }
    } catch {
      return { success: false, error: ReportUnknownError };
    }
  },
  };
};
