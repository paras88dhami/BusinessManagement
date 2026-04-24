import { describe, expect, it, vi } from "vitest";

import { InventoryMovementType } from "@/feature/inventory/types/inventory.types";
import { ProductKind } from "@/feature/products/types/product.types";
import { createCommitPosCheckoutInventoryUseCase } from "@/feature/pos/workflow/posCheckout/useCase/commitPosCheckoutInventory.useCase.impl";

describe("createCommitPosCheckoutInventoryUseCase", () => {
  it("returns success when cart is empty", async () => {
    const saveInventoryMovementsUseCase = {
      execute: vi.fn(),
    };
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(),
    };

    const useCase = createCommitPosCheckoutInventoryUseCase({
      saveInventoryMovementsUseCase:
        saveInventoryMovementsUseCase as never,
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
    });

    const result = await useCase.execute({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      cartLines: [],
      movementAt: Date.now(),
    });

    expect(result.success).toBe(true);
    expect(saveInventoryMovementsUseCase.execute).not.toHaveBeenCalled();
  });

  it("builds sale_out inventory movements and delegates to Inventory", async () => {
    const saveInventoryMovementsUseCase = {
      execute: vi.fn(async (payloads) => ({
        success: true as const,
        value: payloads.map((payload: any) => ({
          remoteId: payload.remoteId,
        })),
      })),
    };
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createCommitPosCheckoutInventoryUseCase({
      saveInventoryMovementsUseCase:
        saveInventoryMovementsUseCase as never,
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
    });

    const result = await useCase.execute({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "product-1",
          productName: "Rice",
          categoryLabel: "Groceries",
          shortCode: "RI",
          kind: ProductKind.Item,
          quantity: 2,
          unitPrice: 100,
          taxRate: 0,
          lineSubtotal: 200,
        },
        {
          lineId: "line-2",
          productId: "product-2",
          productName: "Tea",
          categoryLabel: "Beverages",
          shortCode: "TE",
          kind: ProductKind.Item,
          quantity: 1,
          unitPrice: 50,
          taxRate: 0,
          lineSubtotal: 50,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(saveInventoryMovementsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(saveInventoryMovementsUseCase.execute).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          accountRemoteId: "account-1",
          productRemoteId: "product-1",
          type: InventoryMovementType.SaleOut,
          quantity: 2,
          unitRate: 100,
          sourceRemoteId: "sale-1",
          sourceLineRemoteId: "product-1",
          sourceAction: "checkout_sale",
          remark: "POS sale RCPT-001",
        }),
        expect.objectContaining({
          accountRemoteId: "account-1",
          productRemoteId: "product-2",
          type: InventoryMovementType.SaleOut,
          quantity: 1,
          unitRate: 50,
          sourceRemoteId: "sale-1",
          sourceLineRemoteId: "product-2",
          sourceAction: "checkout_sale",
          remark: "POS sale RCPT-001",
        }),
      ]),
    );
  });

  it("maps inventory below-zero failure to POS out-of-stock", async () => {
    const saveInventoryMovementsUseCase = {
      execute: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "VALIDATION_ERROR",
          message: "Inventory movement would reduce Rice below zero",
        },
      })),
    };
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createCommitPosCheckoutInventoryUseCase({
      saveInventoryMovementsUseCase:
        saveInventoryMovementsUseCase as never,
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
    });

    const result = await useCase.execute({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "product-1",
          productName: "Rice",
          categoryLabel: "Groceries",
          shortCode: "RI",
          kind: ProductKind.Item,
          quantity: 2,
          unitPrice: 100,
          taxRate: 0,
          lineSubtotal: 200,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("OUT_OF_STOCK");
      expect(result.error.message).toBe(
        "Inventory movement would reduce Rice below zero",
      );
    }
  });

  it("returns success and does not call Inventory for service-only cart", async () => {
    const saveInventoryMovementsUseCase = {
      execute: vi.fn(),
    };
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createCommitPosCheckoutInventoryUseCase({
      saveInventoryMovementsUseCase: saveInventoryMovementsUseCase as never,
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
    });

    const result = await useCase.execute({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "service-1",
          productName: "Consultation",
          categoryLabel: "Service",
          shortCode: "CO",
          kind: ProductKind.Service,
          quantity: 1,
          unitPrice: 200,
          taxRate: 0,
          lineSubtotal: 200,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(saveInventoryMovementsUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns success when all expected source movements already exist", async () => {
    const saveInventoryMovementsUseCase = {
      execute: vi.fn(),
    };
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            remoteId: "pos-saleout-sale-1-product-1",
          },
        ],
      })),
    };

    const useCase = createCommitPosCheckoutInventoryUseCase({
      saveInventoryMovementsUseCase: saveInventoryMovementsUseCase as never,
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
    });

    const result = await useCase.execute({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "product-1",
          productName: "Rice",
          categoryLabel: "Groceries",
          shortCode: "RI",
          kind: ProductKind.Item,
          quantity: 2,
          unitPrice: 100,
          taxRate: 0,
          lineSubtotal: 200,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(saveInventoryMovementsUseCase.execute).not.toHaveBeenCalled();
  });

  it("fails safely when source movements are only partially recorded", async () => {
    const saveInventoryMovementsUseCase = {
      execute: vi.fn(),
    };
    const getInventoryMovementsBySourceUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            remoteId: "pos-saleout-sale-1-product-1",
          },
        ],
      })),
    };

    const useCase = createCommitPosCheckoutInventoryUseCase({
      saveInventoryMovementsUseCase: saveInventoryMovementsUseCase as never,
      getInventoryMovementsBySourceUseCase:
        getInventoryMovementsBySourceUseCase as never,
    });

    const result = await useCase.execute({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "product-1",
          productName: "Rice",
          categoryLabel: "Groceries",
          shortCode: "RI",
          kind: ProductKind.Item,
          quantity: 2,
          unitPrice: 100,
          taxRate: 0,
          lineSubtotal: 200,
        },
        {
          lineId: "line-2",
          productId: "product-2",
          productName: "Tea",
          categoryLabel: "Beverages",
          shortCode: "TE",
          kind: ProductKind.Item,
          quantity: 1,
          unitPrice: 50,
          taxRate: 0,
          lineSubtotal: 50,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("VALIDATION");
      expect(result.error.message).toContain("partially recorded");
    }
    expect(saveInventoryMovementsUseCase.execute).not.toHaveBeenCalled();
  });
});
