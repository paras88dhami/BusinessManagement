import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { ReportsDatasource } from "@/feature/reports/data/dataSource/reports.datasource";
import { createReportsRepository } from "@/feature/reports/data/repository/reports.repository.impl";
import {
  ReportMenuItem,
  ReportPeriod,
  ReportQuery,
  ReportScope,
} from "@/feature/reports/types/report.entity.types";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import { describe, expect, it, vi } from "vitest";

const CURRENCY_CODE = "NPR";
const COUNTRY_CODE = "NP";

const createBaseQuery = (reportId: ReportQuery["reportId"]): ReportQuery => ({
  accountType: AccountType.Business,
  scope: ReportScope.Business,
  ownerUserRemoteId: "owner-1",
  accountRemoteId: "account-1",
  period: ReportPeriod.ThisMonth,
  reportId,
});

const createDataset = (overrides: Partial<{
  transactions: unknown[];
  billingDocuments: unknown[];
  ledgerEntries: unknown[];
  emiPlans: unknown[];
  inventoryMovements: unknown[];
  products: unknown[];
  moneyAccounts: unknown[];
}> = {}) => ({
  transactions: [],
  billingDocuments: [],
  ledgerEntries: [],
  emiPlans: [],
  inventoryMovements: [],
  products: [],
  moneyAccounts: [],
  ...overrides,
});

const createDatasource = (dataset: ReturnType<typeof createDataset>): ReportsDatasource => ({
  getDataset: vi.fn(async () => ({
    success: true as const,
    value: dataset as never,
  })),
});

describe("reports.repository", () => {
  it("sorts party balances using numeric outstanding amounts", async () => {
    const dataset = createDataset({
      ledgerEntries: [
        {
          partyName: "Party A",
          entryType: "collection",
          balanceDirection: "receive",
          amount: 100000,
          currencyCode: CURRENCY_CODE,
          happenedAt: Date.now(),
          dueAt: null,
        },
        {
          partyName: "Party B",
          entryType: "payment_out",
          balanceDirection: "pay",
          amount: 800,
          currencyCode: CURRENCY_CODE,
          happenedAt: Date.now(),
          dueAt: null,
        },
        {
          partyName: "Party B",
          entryType: "collection",
          balanceDirection: "receive",
          amount: 300,
          currencyCode: CURRENCY_CODE,
          happenedAt: Date.now(),
          dueAt: null,
        },
        {
          partyName: "Party C",
          entryType: "collection",
          balanceDirection: "receive",
          amount: 5000,
          currencyCode: CURRENCY_CODE,
          happenedAt: Date.now(),
          dueAt: null,
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportDetail(
      createBaseQuery(ReportMenuItem.PartyBalances),
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.listItems?.map((item) => item.title)).toEqual([
      "Party A",
      "Party C",
      "Party B",
    ]);
    expect(result.value.segments?.map((segment) => segment.value)).toEqual([
      100000,
      5000,
      500,
    ]);
  });

  it("computes stock value from numeric valuations without parsing formatted strings", async () => {
    const dataset = createDataset({
      products: [
        {
          remoteId: "product-rice",
          name: "Rice",
          categoryName: "Groceries",
          salePrice: 12,
          costPrice: 10,
          stockQuantity: 3,
          unitLabel: "kg",
          status: "active",
        },
        {
          remoteId: "product-soap",
          name: "Soap",
          categoryName: "Household",
          salePrice: 5,
          costPrice: null,
          stockQuantity: null,
          unitLabel: "pcs",
          status: "active",
        },
      ],
      inventoryMovements: [
        {
          productRemoteId: "product-soap",
          productNameSnapshot: "Soap",
          productUnitLabelSnapshot: "pcs",
          movementType: "purchase_in",
          deltaQuantity: 4,
          unitRate: 5,
          movementAt: Date.now(),
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportDetail(
      createBaseQuery(ReportMenuItem.Stock),
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const expectedStockValue = formatCurrencyAmount({
      amount: 20,
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
      maximumFractionDigits: 0,
    });
    const stockValueCard = result.value.summaryCards.find(
      (item) => item.id === "stock-value",
    );

    expect(stockValueCard?.value).toBe(expectedStockValue);
    expect(result.value.listItems?.[0]?.subtitle).toContain("4 pcs");
  });

  it("uses the selected period for the sales detail trend instead of a fixed six-month window", async () => {
    const currentIssuedAt = Date.now();
    const olderIssuedAt = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 2,
      1,
    ).getTime();

    const dataset = createDataset({
      billingDocuments: [
        {
          remoteId: "doc-current",
          documentType: "invoice",
          customerName: "Walk-in",
          status: "paid",
          totalAmount: 120,
          issuedAt: currentIssuedAt,
        },
        {
          remoteId: "doc-older",
          documentType: "invoice",
          customerName: "Archived",
          status: "paid",
          totalAmount: 900,
          issuedAt: olderIssuedAt,
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportDetail({
      ...createBaseQuery(ReportMenuItem.Sales),
      period: ReportPeriod.ThisWeek,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.lineSeries).toHaveLength(7);
    expect(
      result.value.lineSeries?.reduce((sum, item) => sum + item.value, 0),
    ).toBe(120);

    const salesTotalCard = result.value.summaryCards.find(
      (item) => item.id === "sales-total",
    );

    expect(salesTotalCard?.value).toBe(
      formatCurrencyAmount({
        amount: 120,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );
  });

  it("uses the selected period for all dashboard analytics instead of mixed fixed windows", async () => {
    const now = Date.now();
    const olderAt = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 2,
      1,
    ).getTime();

    const dataset = createDataset({
      transactions: [
        {
          title: "Fuel",
          amount: 15,
          categoryLabel: "Transport",
          happenedAt: now,
          direction: "out",
          transactionType: "expense",
          accountDisplayNameSnapshot: "Cash",
        },
        {
          title: "Old expense",
          amount: 200,
          categoryLabel: "Old",
          happenedAt: olderAt,
          direction: "out",
          transactionType: "expense",
          accountDisplayNameSnapshot: "Cash",
        },
      ],
      billingDocuments: [
        {
          remoteId: "doc-now",
          documentType: "invoice",
          customerName: "Walk-in",
          status: "paid",
          totalAmount: 100,
          issuedAt: now,
        },
        {
          remoteId: "doc-old",
          documentType: "invoice",
          customerName: "Archived",
          status: "paid",
          totalAmount: 900,
          issuedAt: olderAt,
        },
      ],
      ledgerEntries: [
        {
          partyName: "Customer A",
          entryType: "collection",
          balanceDirection: "receive",
          amount: 20,
          currencyCode: CURRENCY_CODE,
          happenedAt: now,
          dueAt: null,
        },
        {
          partyName: "Supplier A",
          entryType: "payment_out",
          balanceDirection: "pay",
          amount: 40,
          currencyCode: CURRENCY_CODE,
          happenedAt: now,
          dueAt: null,
        },
        {
          partyName: "Old Customer",
          entryType: "collection",
          balanceDirection: "receive",
          amount: 50,
          currencyCode: CURRENCY_CODE,
          happenedAt: olderAt,
          dueAt: null,
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportsDashboard({
      ...createBaseQuery(null),
      period: ReportPeriod.ThisWeek,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.periodLabel).toBe("This Week");
    expect(result.value.overviewTrend).toHaveLength(7);
    expect(result.value.incomeExpenseComparison).toHaveLength(7);
    expect(result.value.cashFlowSeries).toHaveLength(7);
    expect(
      result.value.categoryBreakdown.reduce((sum, item) => sum + item.value, 0),
    ).toBe(15);
  });

  it("uses transaction money truth for business dashboard totals instead of combining billing and ledger values", async () => {
    const now = Date.now();

    const dataset = createDataset({
      transactions: [
        {
          title: "Cash sale",
          amount: 100,
          categoryLabel: "Sales",
          happenedAt: now,
          direction: "in",
          transactionType: "sale",
          accountDisplayNameSnapshot: "Cash",
        },
        {
          title: "Expense",
          amount: 30,
          categoryLabel: "Utilities",
          happenedAt: now,
          direction: "out",
          transactionType: "expense",
          accountDisplayNameSnapshot: "Cash",
        },
      ],
      billingDocuments: [
        {
          remoteId: "doc-1",
          documentType: "invoice",
          customerName: "Customer",
          status: "paid",
          totalAmount: 900,
          issuedAt: now,
        },
      ],
      ledgerEntries: [
        {
          partyName: "Customer A",
          entryType: "collection",
          balanceDirection: "receive",
          amount: 50,
          currencyCode: CURRENCY_CODE,
          happenedAt: now,
          dueAt: null,
        },
        {
          partyName: "Supplier A",
          entryType: "payment_out",
          balanceDirection: "pay",
          amount: 40,
          currencyCode: CURRENCY_CODE,
          happenedAt: now,
          dueAt: null,
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportsDashboard(createBaseQuery(null));

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.topSummary.totalIncome).toBe(100);
    expect(result.value.topSummary.totalExpense).toBe(30);
    expect(result.value.topSummary.netCashFlow).toBe(70);
  });

  it("uses expense-only wording for category summary in both menu sections and detail view", async () => {
    const repository = createReportsRepository(createDatasource(createDataset()), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const businessDashboard = await repository.getReportsDashboard({
      accountType: AccountType.Business,
      scope: ReportScope.Business,
      ownerUserRemoteId: "owner-1",
      accountRemoteId: "account-1",
      period: ReportPeriod.ThisMonth,
      reportId: null,
    });

    expect(businessDashboard.success).toBe(true);
    if (!businessDashboard.success) {
      return;
    }

    const businessCategoryEntry = businessDashboard.value.sections
      .flatMap((section) => section.items)
      .find((item) => item.id === ReportMenuItem.CategorySummary);

    expect(businessCategoryEntry?.subtitle).toBe("Expense by category");

    const personalDashboard = await repository.getReportsDashboard({
      accountType: AccountType.Personal,
      scope: ReportScope.Personal,
      ownerUserRemoteId: "owner-1",
      accountRemoteId: null,
      period: ReportPeriod.ThisMonth,
      reportId: null,
    });

    expect(personalDashboard.success).toBe(true);
    if (!personalDashboard.success) {
      return;
    }

    const personalCategoryEntry = personalDashboard.value.sections
      .flatMap((section) => section.items)
      .find((item) => item.id === ReportMenuItem.CategorySummary);

    expect(personalCategoryEntry?.subtitle).toBe("Expense by category");

    const detailResult = await repository.getReportDetail(
      createBaseQuery(ReportMenuItem.CategorySummary),
    );

    expect(detailResult.success).toBe(true);
    if (!detailResult.success) {
      return;
    }

    expect(detailResult.value.chartSubtitle).toBe("Expense by category");
    const categoryTotalCard = detailResult.value.summaryCards.find(
      (item) => item.id === "category-total",
    );
    expect(categoryTotalCard?.label).toBe("Money Out");
  });

  it("uses inventory movement remote-id truth for stock quantity instead of product snapshot stock", async () => {
    const dataset = createDataset({
      products: [
        {
          remoteId: "product-soap",
          name: "Soap",
          categoryName: "Household",
          salePrice: 5,
          costPrice: 10,
          stockQuantity: 99,
          unitLabel: "pcs",
          status: "active",
        },
      ],
      inventoryMovements: [
        {
          productRemoteId: "product-soap",
          productNameSnapshot: "Soap",
          productUnitLabelSnapshot: "pcs",
          movementType: "purchase_in",
          deltaQuantity: 4,
          unitRate: 10,
          movementAt: Date.now(),
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportDetail(
      createBaseQuery(ReportMenuItem.Stock),
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const stockValueCard = result.value.summaryCards.find(
      (item) => item.id === "stock-value",
    );

    expect(stockValueCard?.value).toBe(
      formatCurrencyAmount({
        amount: 40,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );

    expect(result.value.listItems?.[0]?.subtitle).toContain("4 pcs");
  });

  it("builds real csv export content for export data detail", async () => {
    const now = Date.now();

    const dataset = createDataset({
      transactions: [
        {
          title: "Cash sale",
          amount: 100,
          categoryLabel: "Sales",
          happenedAt: now,
          direction: "in",
          transactionType: "sale",
          accountDisplayNameSnapshot: "Cash",
        },
        {
          title: "Office rent",
          amount: 30,
          categoryLabel: "Rent",
          happenedAt: now,
          direction: "out",
          transactionType: "expense",
          accountDisplayNameSnapshot: "Cash",
        },
      ],
      billingDocuments: [],
      ledgerEntries: [],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportDetail({
      ...createBaseQuery(ReportMenuItem.ExportData),
      period: ReportPeriod.ThisWeek,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const expectedCsv = [
      "label,value",
      "Period,This Week",
      "Money In,100",
      "Money Out,30",
      "Net,70",
      "Transactions,2",
      "BillingDocs,0",
      "LedgerEntries,0",
    ].join("\n");

    expect(result.value.csvPreview).toBe(expectedCsv);
    expect(result.value.csvExport).toEqual({
      fileName: "report_export_business_this_week.csv",
      content: expectedCsv,
      mimeType: "text/csv",
    });
  });

  it("groups party balances by contact remote id instead of mutable party name", async () => {
    const now = Date.now();

    const dataset = createDataset({
      ledgerEntries: [
        {
          remoteId: "led-1",
          contactRemoteId: "contact-1",
          partyName: "Kapil Old Name",
          partyPhone: "9800000000",
          entryType: "sale",
          balanceDirection: "receive",
          amount: 70,
          currencyCode: CURRENCY_CODE,
          happenedAt: now - 1000,
          dueAt: null,
        },
        {
          remoteId: "led-2",
          contactRemoteId: "contact-1",
          partyName: "Kapil New Name",
          partyPhone: "9800000000",
          entryType: "collection",
          balanceDirection: "receive",
          amount: 30,
          currencyCode: CURRENCY_CODE,
          happenedAt: now,
          dueAt: null,
        },
        {
          remoteId: "led-3",
          contactRemoteId: "contact-2",
          partyName: "Supplier B",
          partyPhone: "9811111111",
          entryType: "payment_out",
          balanceDirection: "pay",
          amount: 80,
          currencyCode: CURRENCY_CODE,
          happenedAt: now,
          dueAt: null,
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportDetail(
      createBaseQuery(ReportMenuItem.PartyBalances),
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.listItems).toHaveLength(2);
    expect(result.value.listItems?.[0]?.id).toBe("contact:contact-1");
    expect(result.value.listItems?.[0]?.title).toBe("Kapil New Name");
    expect(result.value.listItems?.[0]?.value).toBe(
      formatCurrencyAmount({
        amount: 100,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );

    expect(result.value.listItems?.[1]?.id).toBe("contact:contact-2");
    expect(result.value.listItems?.[1]?.value).toBe(
      formatCurrencyAmount({
        amount: 80,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );
  });

  it("groups account statement by settlement money account remote id instead of mutable display snapshot", async () => {
    const now = Date.now();

    const dataset = createDataset({
      transactions: [
        {
          remoteId: "txn-1",
          title: "Cash sale 1",
          amount: 100,
          categoryLabel: "Sales",
          happenedAt: now,
          direction: "in",
          transactionType: "income",
          accountDisplayNameSnapshot: "Business Account",
          settlementMoneyAccountRemoteId: "cash-1",
          settlementMoneyAccountDisplayNameSnapshot: "Cash Old",
        },
        {
          remoteId: "txn-2",
          title: "Cash expense",
          amount: 40,
          categoryLabel: "Expense",
          happenedAt: now + 1000,
          direction: "out",
          transactionType: "expense",
          accountDisplayNameSnapshot: "Business Account",
          settlementMoneyAccountRemoteId: "cash-1",
          settlementMoneyAccountDisplayNameSnapshot: "Cash Renamed Snapshot",
        },
        {
          remoteId: "txn-3",
          title: "Bank income",
          amount: 60,
          categoryLabel: "Sales",
          happenedAt: now + 2000,
          direction: "in",
          transactionType: "income",
          accountDisplayNameSnapshot: "Business Account",
          settlementMoneyAccountRemoteId: "bank-1",
          settlementMoneyAccountDisplayNameSnapshot: "Bank Snapshot",
        },
      ],
      moneyAccounts: [
        {
          remoteId: "cash-1",
          name: "Cash Current",
          accountType: "cash",
          currentBalance: 1000,
          currencyCode: CURRENCY_CODE,
          isPrimary: true,
          isActive: true,
        },
        {
          remoteId: "bank-1",
          name: "Bank Current",
          accountType: "bank",
          currentBalance: 500,
          currencyCode: CURRENCY_CODE,
          isPrimary: false,
          isActive: true,
        },
        {
          remoteId: "unused-1",
          name: "Unused Account",
          accountType: "cash",
          currentBalance: 0,
          currencyCode: CURRENCY_CODE,
          isPrimary: false,
          isActive: true,
        },
      ],
    });

    const repository = createReportsRepository(createDatasource(dataset), {
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
    });

    const result = await repository.getReportDetail(
      createBaseQuery(ReportMenuItem.AccountStatement),
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const accountsCard = result.value.summaryCards.find(
      (item) => item.id === "statement-accounts",
    );
    expect(accountsCard?.value).toBe("2");

    expect(result.value.listItems).toHaveLength(2);
    expect(result.value.listItems?.[0]?.id).toBe("money_account:cash-1");
    expect(result.value.listItems?.[0]?.title).toBe("Cash Current");
    expect(result.value.listItems?.[0]?.subtitle).toContain(
      formatCurrencyAmount({
        amount: 100,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );
    expect(result.value.listItems?.[0]?.subtitle).toContain(
      formatCurrencyAmount({
        amount: 40,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );

    expect(result.value.listItems?.[1]?.id).toBe("money_account:bank-1");
    expect(result.value.listItems?.[1]?.title).toBe("Bank Current");
  });
});
