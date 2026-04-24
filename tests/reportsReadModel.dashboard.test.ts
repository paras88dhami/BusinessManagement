import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { buildReportsDashboardSnapshot } from "@/feature/reports/readModel/buildReportsDashboardSnapshot.readModel";
import {
  ReportPeriod,
  ReportScope,
  type ReportQuery,
  type ReportsDatasetSnapshot,
} from "@/feature/reports/types/report.entity.types";
import { describe, expect, it } from "vitest";

const NOW_MS = new Date("2026-04-15T10:00:00.000Z").getTime();

const createBaseQuery = (): ReportQuery => ({
  accountType: AccountType.Business,
  scope: ReportScope.Business,
  ownerUserRemoteId: "owner-1",
  accountRemoteId: "account-1",
  period: ReportPeriod.ThisMonth,
  reportId: null,
});

const createDataset = (
  overrides: Partial<ReportsDatasetSnapshot> = {},
): ReportsDatasetSnapshot => ({
  transactions: [],
  billingDocuments: [],
  ledgerEntries: [],
  emiPlans: [],
  inventoryMovements: [],
  products: [],
  moneyAccounts: [],
  ...overrides,
});

describe("buildReportsDashboardSnapshot.readModel", () => {
  it("computes income, expense, net cash flow, and expense-only category breakdown from transactions", () => {
    const dataset = createDataset({
      transactions: [
        {
          remoteId: "txn-in-1",
          title: "Cash sale",
          amount: 120,
          categoryLabel: "Sales",
          happenedAt: NOW_MS,
          direction: "in",
          transactionType: "income",
          accountDisplayNameSnapshot: "Business Account",
          settlementMoneyAccountRemoteId: "cash-1",
          settlementMoneyAccountDisplayNameSnapshot: "Cash",
        },
        {
          remoteId: "txn-out-1",
          title: "Rent",
          amount: 30,
          categoryLabel: "Rent",
          happenedAt: NOW_MS,
          direction: "out",
          transactionType: "expense",
          accountDisplayNameSnapshot: "Business Account",
          settlementMoneyAccountRemoteId: "cash-1",
          settlementMoneyAccountDisplayNameSnapshot: "Cash",
        },
        {
          remoteId: "txn-out-2",
          title: "Snacks",
          amount: 15,
          categoryLabel: "Food",
          happenedAt: NOW_MS,
          direction: "out",
          transactionType: "expense",
          accountDisplayNameSnapshot: "Business Account",
          settlementMoneyAccountRemoteId: "cash-1",
          settlementMoneyAccountDisplayNameSnapshot: "Cash",
        },
      ],
    });

    const snapshot = buildReportsDashboardSnapshot({
      query: createBaseQuery(),
      dataset,
      currencyCode: "NPR",
      countryCode: "NP",
      nowMs: NOW_MS,
    });

    expect(snapshot.topSummary.totalIncome).toBe(120);
    expect(snapshot.topSummary.totalExpense).toBe(45);
    expect(snapshot.topSummary.netCashFlow).toBe(75);
    expect(
      snapshot.categoryBreakdown.reduce((sum, segment) => sum + segment.value, 0),
    ).toBe(45);
    expect(snapshot.categoryBreakdown.find((segment) => segment.label === "Sales")).toBeUndefined();
  });
});
