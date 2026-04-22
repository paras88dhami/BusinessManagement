import { describe, expect, it, vi } from "vitest";

import { createSaveInventoryMovementUseCase } from "@/feature/inventory/useCase/saveInventoryMovement.useCase.impl";
import { InventoryMovementType } from "@/feature/inventory/types/inventory.types";
import {
  ProductKind,
  ProductStatus,
  type Product,
} from "@/feature/products/types/product.types";

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  remoteId: "product-1",
  accountRemoteId: "account-1",
  name: "Rice Bag",
  kind: ProductKind.Item,
  categoryName: "Groceries",
  salePrice: 100,
  costPrice: 80,
  stockQuantity: 5,
  unitLabel: "bag",
  skuOrBarcode: null,
  taxRateLabel: null,
  description: null,
  imageUrl: null,
  status: ProductStatus.Active,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

describe("createSaveInventoryMovementUseCase", () => {
  it("rejects when account remote id is missing", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(),
    };

    const inventoryRepository = {
      saveInventoryMovement: vi.fn(),
    };

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute({
      remoteId: "move-1",
      accountRemoteId: "   ",
      productRemoteId: "product-1",
      type: InventoryMovementType.StockIn,
      quantity: 2,
      unitRate: 80,
      reason: null,
      remark: "Restock",
      sourceModule: "manual",
      sourceRemoteId: "source-1",
      sourceLineRemoteId: null,
      sourceAction: null,
      movementAt: Date.now(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Account remote id is required.");
    }
    expect(productRepository.getProductsByAccountRemoteId).not.toHaveBeenCalled();
    expect(inventoryRepository.saveInventoryMovement).not.toHaveBeenCalled();
  });

  it("rejects stock mutation for non-item products", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          buildProduct({
            kind: ProductKind.Service,
            stockQuantity: null,
          }),
        ],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovement: vi.fn(),
    };

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute({
      remoteId: "move-1",
      accountRemoteId: "account-1",
      productRemoteId: "product-1",
      type: InventoryMovementType.StockIn,
      quantity: 2,
      unitRate: 80,
      reason: null,
      remark: "Restock",
      sourceModule: "manual",
      sourceRemoteId: "source-1",
      sourceLineRemoteId: null,
      sourceAction: null,
      movementAt: Date.now(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "Inventory movement can only be recorded for item products",
      );
    }
    expect(inventoryRepository.saveInventoryMovement).not.toHaveBeenCalled();
  });

  it("rejects movement that would reduce stock below zero", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          buildProduct({
            stockQuantity: 1,
          }),
        ],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovement: vi.fn(),
    };

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute({
      remoteId: "move-1",
      accountRemoteId: "account-1",
      productRemoteId: "product-1",
      type: InventoryMovementType.SaleOut,
      quantity: 2,
      unitRate: 100,
      reason: null,
      remark: "Sold item",
      sourceModule: "orders",
      sourceRemoteId: "order-1",
      sourceLineRemoteId: "line-1",
      sourceAction: "deliver",
      movementAt: Date.now(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "Inventory movement would reduce Rice Bag below zero",
      );
    }
    expect(inventoryRepository.saveInventoryMovement).not.toHaveBeenCalled();
  });

  it("rejects invalid source metadata combinations", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [buildProduct()],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovement: vi.fn(),
    };

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute({
      remoteId: "move-1",
      accountRemoteId: "account-1",
      productRemoteId: "product-1",
      type: InventoryMovementType.StockIn,
      quantity: 2,
      unitRate: 80,
      reason: null,
      remark: "Restock",
      sourceModule: "manual",
      sourceRemoteId: null,
      sourceLineRemoteId: null,
      sourceAction: null,
      movementAt: Date.now(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "Inventory movement source remote id is required",
      );
    }
    expect(inventoryRepository.saveInventoryMovement).not.toHaveBeenCalled();
  });

  it("passes normalized validated movement to repository", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          buildProduct({
            stockQuantity: 5,
          }),
        ],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovement: vi.fn(async (payload) => ({
        success: true as const,
        value: {
          remoteId: payload.remoteId,
          accountRemoteId: payload.accountRemoteId,
          productRemoteId: payload.productRemoteId,
          productName: "Rice Bag",
          productUnitLabel: "bag",
          type: payload.type,
          quantity: payload.quantity,
          deltaQuantity: payload.quantity,
          unitRate: payload.unitRate,
          totalValue: 160,
          reason: payload.reason,
          remark: payload.remark,
          sourceModule: payload.sourceModule ?? null,
          sourceRemoteId: payload.sourceRemoteId ?? null,
          sourceLineRemoteId: payload.sourceLineRemoteId ?? null,
          sourceAction: payload.sourceAction ?? null,
          movementAt: payload.movementAt,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      })),
    };

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute({
      remoteId: " move-1 ",
      accountRemoteId: " account-1 ",
      productRemoteId: " product-1 ",
      type: InventoryMovementType.StockIn,
      quantity: 2,
      unitRate: 80,
      reason: null,
      remark: " Restock ",
      sourceModule: " manual ",
      sourceRemoteId: " source-1 ",
      sourceLineRemoteId: null,
      sourceAction: null,
      movementAt: Date.now(),
    });

    expect(result.success).toBe(true);
    expect(productRepository.getProductsByAccountRemoteId).toHaveBeenCalledWith(
      "account-1",
    );
    expect(inventoryRepository.saveInventoryMovement).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.saveInventoryMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        remoteId: "move-1",
        accountRemoteId: "account-1",
        productRemoteId: "product-1",
        sourceModule: "manual",
        sourceRemoteId: "source-1",
        remark: "Restock",
      }),
    );
  });
});
