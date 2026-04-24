import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { buildReportDetailSnapshot } from "@/feature/reports/readModel/buildReportDetailSnapshot.readModel";
import {
  ReportMenuItem,
  ReportPeriod,
  ReportScope,
  type ReportQuery,
  type ReportsDatasetSnapshot,
} from "@/feature/reports/types/report.entity.types";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import { describe, expect, it } from "vitest";

const NOW_MS = new Date("2026-04-15T10:00:00.000Z").getTime();
const CURRENCY_CODE = "NPR";
const COUNTRY_CODE = "NP";

const createBaseQuery = (
  reportId: ReportQuery["reportId"],
): ReportQuery => ({
  accountType: AccountType.Business,
  scope: ReportScope.Business,
  ownerUserRemoteId: "owner-1",
  accountRemoteId: "account-1",
  period: ReportPeriod.ThisMonth,
  reportId,
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

describe("buildReportDetailSnapshot.readModel", () => {
  it("computes sales using invoice/receipt positive and credit note negative with chart parity", () => {
    const detail = buildReportDetailSnapshot({
      query: createBaseQuery(ReportMenuItem.Sales),
      dataset: createDataset({
        billingDocuments: [
          {
            remoteId: "doc-1",
            documentType: "invoice",
            customerName: "A",
            status: "paid",
            totalAmount: 100,
            issuedAt: NOW_MS,
          },
          {
            remoteId: "doc-2",
            documentType: "receipt",
            customerName: "B",
            status: "paid",
            totalAmount: 50,
            issuedAt: NOW_MS,
          },
          {
            remoteId: "doc-3",
            documentType: "credit_note",
            customerName: "C",
            status: "paid",
            totalAmount: 30,
            issuedAt: NOW_MS,
          },
        ],
      }),
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
      nowMs: NOW_MS,
    });

    expect(detail).not.toBeNull();
    if (!detail) {
      return;
    }

    const totalFromSeries =
      detail.lineSeries?.reduce((sum, point) => sum + point.value, 0) ?? 0;
    const netSalesCard = detail.summaryCards.find((card) => card.id === "sales-total");

    expect(totalFromSeries).toBe(120);
    expect(netSalesCard?.value).toBe(
      formatCurrencyAmount({
        amount: 120,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );
  });

  it("groups party balances by contactRemoteId first with fallback to name and phone when contact id is missing", () => {
    const detail = buildReportDetailSnapshot({
      query: createBaseQuery(ReportMenuItem.PartyBalances),
      dataset: createDataset({
        ledgerEntries: [
          {
            remoteId: "led-1",
            partyName: "Kapil Old",
            partyPhone: "9800000000",
            contactRemoteId: "contact-1",
            entryType: "sale",
            balanceDirection: "receive",
            amount: 70,
            currencyCode: CURRENCY_CODE,
            happenedAt: NOW_MS - 1000,
            dueAt: null,
          },
          {
            remoteId: "led-2",
            partyName: "Kapil New",
            partyPhone: "9800000000",
            contactRemoteId: "contact-1",
            entryType: "collection",
            balanceDirection: "receive",
            amount: 30,
            currencyCode: CURRENCY_CODE,
            happenedAt: NOW_MS,
            dueAt: null,
          },
          {
            remoteId: "led-3",
            partyName: "No Contact",
            partyPhone: "9811111111",
            contactRemoteId: null,
            entryType: "payment_out",
            balanceDirection: "pay",
            amount: 40,
            currencyCode: CURRENCY_CODE,
            happenedAt: NOW_MS,
            dueAt: null,
          },
        ],
      }),
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
      nowMs: NOW_MS,
    });

    expect(detail).not.toBeNull();
    if (!detail) {
      return;
    }

    const contactItem = detail.listItems?.find((item) => item.id === "contact:contact-1");
    const fallbackItem = detail.listItems?.find((item) =>
      item.id.startsWith("unlinked:no contact:"),
    );

    expect(contactItem?.title).toBe("Kapil New");
    expect(fallbackItem?.title).toContain("No Contact");
  });

  it("groups account statement by settlementMoneyAccountRemoteId first with fallback to snapshot label", () => {
    const detail = buildReportDetailSnapshot({
      query: createBaseQuery(ReportMenuItem.AccountStatement),
      dataset: createDataset({
        transactions: [
          {
            remoteId: "txn-1",
            title: "Cash in",
            amount: 100,
            categoryLabel: "Sales",
            happenedAt: NOW_MS,
            direction: "in",
            transactionType: "income",
            accountDisplayNameSnapshot: "Business Account",
            settlementMoneyAccountRemoteId: "cash-1",
            settlementMoneyAccountDisplayNameSnapshot: "Cash Old",
          },
          {
            remoteId: "txn-2",
            title: "Cash out",
            amount: 40,
            categoryLabel: "Expense",
            happenedAt: NOW_MS + 1000,
            direction: "out",
            transactionType: "expense",
            accountDisplayNameSnapshot: "Business Account",
            settlementMoneyAccountRemoteId: "cash-1",
            settlementMoneyAccountDisplayNameSnapshot: "Cash New",
          },
          {
            remoteId: "txn-3",
            title: "Wallet in",
            amount: 20,
            categoryLabel: "Sales",
            happenedAt: NOW_MS + 2000,
            direction: "in",
            transactionType: "income",
            accountDisplayNameSnapshot: "Business Account",
            settlementMoneyAccountRemoteId: null,
            settlementMoneyAccountDisplayNameSnapshot: "Wallet",
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
        ],
      }),
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
      nowMs: NOW_MS,
    });

    expect(detail).not.toBeNull();
    if (!detail) {
      return;
    }

    expect(detail.listItems?.find((item) => item.id === "money_account:cash-1")?.title).toBe(
      "Cash Current",
    );
    expect(detail.listItems?.find((item) => item.id === "snapshot:wallet")?.title).toBe(
      "Wallet",
    );
  });

  it("uses expense-only category grouping with explicit fallback label for missing category", () => {
    const detail = buildReportDetailSnapshot({
      query: createBaseQuery(ReportMenuItem.CategorySummary),
      dataset: createDataset({
        transactions: [
          {
            remoteId: "txn-1",
            title: "Food",
            amount: 20,
            categoryLabel: "Food",
            happenedAt: NOW_MS,
            direction: "out",
            transactionType: "expense",
            accountDisplayNameSnapshot: "Business Account",
            settlementMoneyAccountRemoteId: "cash-1",
            settlementMoneyAccountDisplayNameSnapshot: "Cash",
          },
          {
            remoteId: "txn-2",
            title: "Unknown Expense",
            amount: 10,
            categoryLabel: null,
            happenedAt: NOW_MS,
            direction: "out",
            transactionType: "expense",
            accountDisplayNameSnapshot: "Business Account",
            settlementMoneyAccountRemoteId: "cash-1",
            settlementMoneyAccountDisplayNameSnapshot: "Cash",
          },
          {
            remoteId: "txn-3",
            title: "Income",
            amount: 90,
            categoryLabel: "Sales",
            happenedAt: NOW_MS,
            direction: "in",
            transactionType: "income",
            accountDisplayNameSnapshot: "Business Account",
            settlementMoneyAccountRemoteId: "cash-1",
            settlementMoneyAccountDisplayNameSnapshot: "Cash",
          },
        ],
      }),
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
      nowMs: NOW_MS,
    });

    expect(detail).not.toBeNull();
    if (!detail) {
      return;
    }

    expect(detail.chartSubtitle).toBe("Expense by category");
    expect(detail.segments?.find((segment) => segment.label === "Others")?.value).toBe(10);
    expect(detail.segments?.find((segment) => segment.label === "Sales")).toBeUndefined();
  });

  it("uses inventory movement delta quantity for stock instead of product snapshot stock", () => {
    const detail = buildReportDetailSnapshot({
      query: createBaseQuery(ReportMenuItem.Stock),
      dataset: createDataset({
        products: [
          {
            remoteId: "product-1",
            name: "Soap",
            categoryName: "Household",
            salePrice: 12,
            costPrice: 10,
            stockQuantity: 99,
            unitLabel: "pcs",
            status: "active",
          },
        ],
        inventoryMovements: [
          {
            productRemoteId: "product-1",
            productNameSnapshot: "Soap",
            productUnitLabelSnapshot: "pcs",
            movementType: "purchase_in",
            deltaQuantity: 4,
            unitRate: 10,
            movementAt: NOW_MS,
          },
        ],
      }),
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
      nowMs: NOW_MS,
    });

    expect(detail).not.toBeNull();
    if (!detail) {
      return;
    }

    expect(detail.listItems?.[0]?.subtitle).toContain("4 pcs");
    expect(detail.summaryCards.find((card) => card.id === "stock-value")?.value).toBe(
      formatCurrencyAmount({
        amount: 40,
        currencyCode: CURRENCY_CODE,
        countryCode: COUNTRY_CODE,
        maximumFractionDigits: 0,
      }),
    );
  });
});
