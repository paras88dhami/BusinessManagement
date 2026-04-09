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
          name: "Rice",
          categoryName: "Groceries",
          salePrice: 12,
          costPrice: 10,
          stockQuantity: 3,
          status: "active",
        },
        {
          name: "Soap",
          categoryName: "Household",
          salePrice: 5,
          costPrice: null,
          stockQuantity: null,
          status: "active",
        },
      ],
      inventoryMovements: [
        {
          productNameSnapshot: "Soap",
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
      amount: 50,
      currencyCode: CURRENCY_CODE,
      countryCode: COUNTRY_CODE,
      maximumFractionDigits: 0,
    });
    const stockValueCard = result.value.summaryCards.find(
      (item) => item.id === "stock-value",
    );

    expect(stockValueCard?.value).toBe(expectedStockValue);
    expect(result.value.listItems?.[0]?.subtitle.includes("|")).toBe(true);
  });
});

