import { createPosSaleRepository } from "@/feature/pos/data/repository/posSale.repository.impl";
import { PosSaleWorkflowStatus } from "@/feature/pos/types/posSale.constant";
import { describe, expect, it, vi } from "vitest";

const buildModel = (overrides: Record<string, unknown> = {}) => ({
  remoteId: "sale-1",
  receiptNumber: "RCPT-1",
  businessAccountRemoteId: "account-1",
  ownerUserRemoteId: "owner-1",
  idempotencyKey: "idem-1",
  workflowStatus: PosSaleWorkflowStatus.Posted,
  customerRemoteId: null,
  customerNameSnapshot: null,
  customerPhoneSnapshot: null,
  currencyCode: "NPR",
  countryCode: "NP",
  itemCount: 1,
  gross: 100,
  discountAmount: 0,
  surchargeAmount: 0,
  taxAmount: 0,
  grandTotal: 100,
  cartLinesSnapshotJson: JSON.stringify([]),
  paymentPartsSnapshotJson: JSON.stringify([]),
  receiptSnapshotJson: null,
  billingDocumentRemoteId: null,
  ledgerEntryRemoteId: null,
  postedTransactionRemoteIdsJson: JSON.stringify([]),
  lastErrorType: null,
  lastErrorMessage: null,
  createdAt: new Date(1710000000000),
  updatedAt: new Date(1710000001000),
  ...overrides,
});

describe("posSale.repository", () => {
  it("getPosSales maps datasource models to POS sale records", async () => {
    const datasource = {
      createPosSaleRecord: vi.fn(),
      getPosSaleByIdempotencyKey: vi.fn(),
      updatePosSaleWorkflowState: vi.fn(),
      getPosSales: vi.fn(async () => ({
        success: true as const,
        value: [buildModel()],
      })),
    };

    const repository = createPosSaleRepository(datasource as never);

    const result = await repository.getPosSales({
      businessAccountRemoteId: "account-1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value[0]?.remoteId).toBe("sale-1");
      expect(result.value[0]?.totalsSnapshot.grandTotal).toBe(100);
    }
  });

  it("getPosSales maps datasource failure to POS sale validation error", async () => {
    const datasource = {
      createPosSaleRecord: vi.fn(),
      getPosSaleByIdempotencyKey: vi.fn(),
      updatePosSaleWorkflowState: vi.fn(),
      getPosSales: vi.fn(async () => ({
        success: false as const,
        error: new Error(
          "Business account context is required to load POS sale history.",
        ),
      })),
    };

    const repository = createPosSaleRepository(datasource as never);

    const result = await repository.getPosSales({
      businessAccountRemoteId: "",
    });

    expect(result).toEqual({
      success: false,
      error: {
        type: "VALIDATION",
        message:
          "Business account context is required to load POS sale history.",
      },
    });
  });
});
