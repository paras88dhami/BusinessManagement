import { describe, expect, it, vi } from "vitest";

import { createSaveInventoryMovementsUseCase } from "@/feature/inventory/useCase/saveInventoryMovements.useCase.impl";
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

describe("createSaveInventoryMovementsUseCase", () => {
  it("rejects empty batch", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(),
    };

    const inventoryRepository = {
      saveInventoryMovements: vi.fn(),
    };

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute([]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "At least one inventory movement payload is required.",
      );
    }
    expect(productRepository.getProductsByAccountRemoteId).not.toHaveBeenCalled();
    expect(inventoryRepository.saveInventoryMovements).not.toHaveBeenCalled();
  });

  it("rejects mixed-account batch", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [buildProduct()],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovements: vi.fn(),
    };

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute([
      {
        remoteId: "move-1",
        accountRemoteId: "account-1",
        productRemoteId: "product-1",
        type: InventoryMovementType.StockIn,
        quantity: 1,
        unitRate: 80,
        reason: null,
        remark: "Batch 1",
        sourceModule: "manual",
        sourceRemoteId: "source-1",
        sourceLineRemoteId: null,
        sourceAction: null,
        movementAt: Date.now(),
      },
      {
        remoteId: "move-2",
        accountRemoteId: "account-2",
        productRemoteId: "product-1",
        type: InventoryMovementType.StockIn,
        quantity: 1,
        unitRate: 80,
        reason: null,
        remark: "Batch 2",
        sourceModule: "manual",
        sourceRemoteId: "source-2",
        sourceLineRemoteId: null,
        sourceAction: null,
        movementAt: Date.now(),
      },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "All inventory movement payloads in one save operation must belong to the same account",
      );
    }
    expect(inventoryRepository.saveInventoryMovements).not.toHaveBeenCalled();
  });

  it("rejects duplicate movement ids in batch", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [buildProduct()],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovements: vi.fn(),
    };

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute([
      {
        remoteId: "move-1",
        accountRemoteId: "account-1",
        productRemoteId: "product-1",
        type: InventoryMovementType.StockIn,
        quantity: 1,
        unitRate: 80,
        reason: null,
        remark: "Batch 1",
        sourceModule: "manual",
        sourceRemoteId: "source-1",
        sourceLineRemoteId: null,
        sourceAction: null,
        movementAt: Date.now(),
      },
      {
        remoteId: "move-1",
        accountRemoteId: "account-1",
        productRemoteId: "product-1",
        type: InventoryMovementType.StockIn,
        quantity: 1,
        unitRate: 80,
        reason: null,
        remark: "Batch 2",
        sourceModule: "manual",
        sourceRemoteId: "source-2",
        sourceLineRemoteId: null,
        sourceAction: null,
        movementAt: Date.now(),
      },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "Duplicate inventory movement remote id in batch",
      );
    }
    expect(inventoryRepository.saveInventoryMovements).not.toHaveBeenCalled();
  });

  it("rejects batch that would reduce stock below zero", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          buildProduct({
            remoteId: "product-1",
            stockQuantity: 1,
          }),
        ],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovements: vi.fn(),
    };

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute([
      {
        remoteId: "move-1",
        accountRemoteId: "account-1",
        productRemoteId: "product-1",
        type: InventoryMovementType.SaleOut,
        quantity: 2,
        unitRate: 100,
        reason: null,
        remark: "Delivery",
        sourceModule: "orders",
        sourceRemoteId: "order-1",
        sourceLineRemoteId: "line-1",
        sourceAction: "deliver",
        movementAt: Date.now(),
      },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "Inventory movement would reduce Rice Bag below zero",
      );
    }
    expect(inventoryRepository.saveInventoryMovements).not.toHaveBeenCalled();
  });

  it("passes validated normalized batch to repository", async () => {
    const productRepository = {
      getProductsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          buildProduct({
            remoteId: "product-1",
            stockQuantity: 10,
            name: "Rice Bag",
          }),
          buildProduct({
            remoteId: "product-2",
            stockQuantity: 3,
            name: "Tea Box",
          }),
        ],
      })),
    };

    const inventoryRepository = {
      saveInventoryMovements: vi.fn(async (payloads) => ({
        success: true as const,
        value: payloads.map((payload) => ({
          remoteId: payload.remoteId,
          accountRemoteId: payload.accountRemoteId,
          productRemoteId: payload.productRemoteId,
          productName:
            payload.productRemoteId === "product-1" ? "Rice Bag" : "Tea Box",
          productUnitLabel: "bag",
          type: payload.type,
          quantity: payload.quantity,
          deltaQuantity:
            payload.type === InventoryMovementType.SaleOut
              ? payload.quantity * -1
              : payload.quantity,
          unitRate: payload.unitRate,
          totalValue: null,
          reason: payload.reason,
          remark: payload.remark,
          sourceModule: payload.sourceModule ?? null,
          sourceRemoteId: payload.sourceRemoteId ?? null,
          sourceLineRemoteId: payload.sourceLineRemoteId ?? null,
          sourceAction: payload.sourceAction ?? null,
          movementAt: payload.movementAt,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })),
      })),
    };

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository: inventoryRepository as never,
      productRepository: productRepository as never,
    });

    const result = await useCase.execute([
      {
        remoteId: " move-1 ",
        accountRemoteId: " account-1 ",
        productRemoteId: " product-1 ",
        type: InventoryMovementType.SaleOut,
        quantity: 2,
        unitRate: 100,
        reason: null,
        remark: " Sale 1 ",
        sourceModule: " orders ",
        sourceRemoteId: " order-1 ",
        sourceLineRemoteId: " line-1 ",
        sourceAction: " delivery ",
        movementAt: Date.now(),
      },
      {
        remoteId: " move-2 ",
        accountRemoteId: " account-1 ",
        productRemoteId: " product-2 ",
        type: InventoryMovementType.StockIn,
        quantity: 4,
        unitRate: 50,
        reason: null,
        remark: " Restock ",
        sourceModule: " manual ",
        sourceRemoteId: " source-2 ",
        sourceLineRemoteId: null,
        sourceAction: null,
        movementAt: Date.now(),
      },
    ]);

    expect(result.success).toBe(true);
    expect(productRepository.getProductsByAccountRemoteId).toHaveBeenCalledWith(
      "account-1",
    );
    expect(inventoryRepository.saveInventoryMovements).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.saveInventoryMovements).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          remoteId: "move-1",
          accountRemoteId: "account-1",
          productRemoteId: "product-1",
          sourceModule: "orders",
          sourceRemoteId: "order-1",
          sourceLineRemoteId: "line-1",
          sourceAction: "delivery",
          remark: "Sale 1",
        }),
        expect.objectContaining({
          remoteId: "move-2",
          accountRemoteId: "account-1",
          productRemoteId: "product-2",
          sourceModule: "manual",
          sourceRemoteId: "source-2",
          remark: "Restock",
        }),
      ]),
    );
  });
});
