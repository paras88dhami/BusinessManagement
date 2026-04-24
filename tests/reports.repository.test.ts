import type { ReportsDatasource } from "@/feature/reports/data/dataSource/reports.datasource";
import { createReportsRepository } from "@/feature/reports/data/repository/reports.repository.impl";
import {
  ReportPeriod,
  ReportQuery,
  ReportScope,
} from "@/feature/reports/types/report.entity.types";
import { describe, expect, it, vi } from "vitest";

const createBaseQuery = (): ReportQuery => ({
  accountType: "business",
  scope: ReportScope.Business,
  ownerUserRemoteId: "owner-1",
  accountRemoteId: "account-1",
  period: ReportPeriod.ThisMonth,
  reportId: null,
});

const createRawDataset = (overrides: Partial<{
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

describe("reports.repository", () => {
  it("returns validation error when both account and owner scope are missing", async () => {
    const datasource: ReportsDatasource = {
      getDataset: vi.fn(),
    };
    const repository = createReportsRepository(datasource);

    const result = await repository.getReportsDataset({
      ...createBaseQuery(),
      ownerUserRemoteId: null,
      accountRemoteId: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("VALIDATION_ERROR");
      expect(result.error.message).toBe("Active report scope is missing.");
    }
    expect(datasource.getDataset).not.toHaveBeenCalled();
  });

  it("maps datasource models into report dataset snapshot without building formulas", async () => {
    const datasource: ReportsDatasource = {
      getDataset: vi.fn(async () => ({
        success: true as const,
        value: createRawDataset({
          transactions: [
            {
              remoteId: "txn-1",
              title: "Cash sale",
              amount: 100,
              categoryLabel: "Sales",
              happenedAt: 1710000000000,
              direction: "in",
              transactionType: "income",
              accountDisplayNameSnapshot: "Business Account",
              settlementMoneyAccountRemoteId: "cash-1",
              settlementMoneyAccountDisplayNameSnapshot: "Cash",
            },
          ],
          billingDocuments: [
            {
              remoteId: "doc-1",
              documentType: "invoice",
              customerName: "Walk-in",
              status: "paid",
              totalAmount: 100,
              issuedAt: 1710000000000,
            },
          ],
          ledgerEntries: [
            {
              remoteId: "led-1",
              partyName: "Customer A",
              partyPhone: "9800000000",
              contactRemoteId: "contact-1",
              entryType: "sale",
              balanceDirection: "receive",
              amount: 100,
              currencyCode: "NPR",
              happenedAt: 1710000000000,
              dueAt: null,
            },
          ],
          emiPlans: [
            {
              title: "Bike Loan",
              totalAmount: 50000,
              paidAmount: 10000,
              installmentCount: 10,
              paidInstallmentCount: 2,
              nextDueAt: null,
              status: "active",
            },
          ],
          inventoryMovements: [
            {
              productRemoteId: "product-1",
              productNameSnapshot: "Rice",
              productUnitLabelSnapshot: "kg",
              movementType: "sale_out",
              deltaQuantity: -1,
              unitRate: 100,
              movementAt: 1710000000000,
            },
          ],
          products: [
            {
              remoteId: "product-1",
              name: "Rice",
              categoryName: "Groceries",
              salePrice: 110,
              costPrice: 90,
              stockQuantity: 20,
              unitLabel: "kg",
              status: "active",
            },
          ],
          moneyAccounts: [
            {
              remoteId: "cash-1",
              name: "Cash",
              accountType: "cash",
              currentBalance: 1200,
              currencyCode: "NPR",
              isPrimary: true,
              isActive: true,
            },
          ],
        }) as never,
      })),
    };

    const repository = createReportsRepository(datasource);
    const result = await repository.getReportsDataset(createBaseQuery());

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.transactions[0]).toEqual(
      expect.objectContaining({
        remoteId: "txn-1",
        title: "Cash sale",
        amount: 100,
      }),
    );
    expect(result.value.billingDocuments[0]).toEqual(
      expect.objectContaining({
        remoteId: "doc-1",
        totalAmount: 100,
      }),
    );
    expect(result.value.ledgerEntries[0]).toEqual(
      expect.objectContaining({
        remoteId: "led-1",
        contactRemoteId: "contact-1",
      }),
    );
    expect(result.value.emiPlans).toHaveLength(1);
    expect(result.value.inventoryMovements).toHaveLength(1);
    expect(result.value.products).toHaveLength(1);
    expect(result.value.moneyAccounts).toHaveLength(1);
    expect((result.value as Record<string, unknown>).topSummary).toBeUndefined();
  });

  it("maps datasource failure to database error", async () => {
    const datasource: ReportsDatasource = {
      getDataset: vi.fn(async () => ({
        success: false as const,
        error: new Error("db failed"),
      })),
    };
    const repository = createReportsRepository(datasource);

    const result = await repository.getReportsDataset(createBaseQuery());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("DATABASE_ERROR");
    }
  });
});
