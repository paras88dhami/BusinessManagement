import { BillingErrorType } from "@/feature/billing/types/billing.types";
import {
  InventoryMovementSourceModule,
  InventoryMovementType,
} from "@/feature/inventory/types/inventory.types";
import { LedgerErrorType } from "@/feature/ledger/types/ledger.error.types";
import { PosArtifactReconciliationStatus } from "@/feature/pos/types/posSaleHistory.entity.types";
import { createReconcilePosSaleUseCase } from "@/feature/pos/workflow/posRecovery/useCase/reconcilePosSale.useCase.impl";
import { describe, expect, it, vi } from "vitest";

const buildSale = (overrides: Record<string, unknown> = {}) => ({
  remoteId: "sale-1",
  receiptNumber: "R-1",
  businessAccountRemoteId: "account-1",
  ownerUserRemoteId: "owner-1",
  idempotencyKey: "idem-1",
  workflowStatus: "failed",
  customerRemoteId: null,
  customerNameSnapshot: null,
  customerPhoneSnapshot: null,
  currencyCode: "NPR",
  countryCode: "NP",
  cartLinesSnapshot: [],
  totalsSnapshot: {
    itemCount: 1,
    gross: 100,
    discountAmount: 0,
    surchargeAmount: 0,
    taxAmount: 0,
    grandTotal: 100,
  },
  paymentParts: [],
  receipt: null,
  billingDocumentRemoteId: null,
  ledgerEntryRemoteId: null,
  postedTransactionRemoteIds: [],
  lastErrorType: null,
  lastErrorMessage: null,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

describe("createReconcilePosSaleUseCase", () => {
  it("keeps cleanup actionable when inventory movements still remain", async () => {
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            remoteId: "move-1",
            accountRemoteId: "account-1",
            productRemoteId: "product-1",
            productName: "Tea",
            productUnitLabel: "pcs",
            type: InventoryMovementType.SaleOut,
            quantity: 1,
            deltaQuantity: -1,
            unitRate: 100,
            totalValue: 100,
            reason: null,
            remark: "POS sale R-1",
            sourceModule: InventoryMovementSourceModule.Pos,
            sourceRemoteId: "sale-1",
            sourceLineRemoteId: "product-1",
            sourceAction: "checkout_sale",
            movementAt: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        ],
      })),
    };

    const getBillingDocumentByRemoteIdUseCase = {
      execute: vi.fn(),
    };

    const getLedgerEntryByRemoteIdUseCase = {
      execute: vi.fn(),
    };

    const useCase = createReconcilePosSaleUseCase({
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
      getBillingDocumentByRemoteIdUseCase:
        getBillingDocumentByRemoteIdUseCase as never,
      getLedgerEntryByRemoteIdUseCase: getLedgerEntryByRemoteIdUseCase as never,
    });

    const result = await useCase.execute({
      sale: buildSale() as never,
    });

    expect(getInventoryMovementsBySourceUseCase.execute).toHaveBeenCalledWith({
      accountRemoteId: "account-1",
      sourceModule: InventoryMovementSourceModule.Pos,
      sourceRemoteId: "sale-1",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.inventoryMovements.status).toBe(
      PosArtifactReconciliationStatus.Present,
    );
    expect(result.value.inventoryMovements.remoteIds).toEqual(["move-1"]);
    expect(result.value.hasUnresolvedArtifacts).toBe(true);
    expect(result.value.canRunCleanup).toBe(true);
  });

  it("keeps cleanup actionable when billing or ledger refs are stale and missing", async () => {
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const getBillingDocumentByRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: false as const,
        error: {
          type: BillingErrorType.DocumentNotFound,
          message: "The requested billing document was not found.",
        },
      })),
    };

    const getLedgerEntryByRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: false as const,
        error: {
          type: LedgerErrorType.LedgerEntryNotFound,
          message: "The selected ledger entry was not found.",
        },
      })),
    };

    const useCase = createReconcilePosSaleUseCase({
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
      getBillingDocumentByRemoteIdUseCase:
        getBillingDocumentByRemoteIdUseCase as never,
      getLedgerEntryByRemoteIdUseCase: getLedgerEntryByRemoteIdUseCase as never,
    });

    const result = await useCase.execute({
      sale: buildSale({
        billingDocumentRemoteId: "doc-1",
        ledgerEntryRemoteId: "ledger-1",
      }) as never,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.billingDocument.status).toBe(
      PosArtifactReconciliationStatus.Missing,
    );
    expect(result.value.ledgerEntry.status).toBe(
      PosArtifactReconciliationStatus.Missing,
    );
    expect(result.value.hasUnresolvedArtifacts).toBe(true);
    expect(result.value.canRunCleanup).toBe(true);
  });
});
