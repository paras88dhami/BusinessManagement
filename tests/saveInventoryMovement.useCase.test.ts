import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import {
  InventoryMovementType,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import { createSaveInventoryMovementUseCase } from "@/feature/inventory/useCase/saveInventoryMovement.useCase.impl";
import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import { Product, ProductKind, ProductStatus } from "@/feature/products/types/product.types";
import { describe, expect, it, vi } from "vitest";

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

const createProductRepository = (
  products: Product[],
): {
  productRepository: ProductRepository;
  getProductsByAccountRemoteIdMock: ReturnType<typeof vi.fn>;
} => {
  const getProductsByAccountRemoteIdMock = vi.fn(async () => ({
    success: true as const,
    value: products,
  }));

  return {
    productRepository: {
      saveProduct: vi.fn(async () => {
        throw new Error("Not implemented for this test");
      }),
      getProductsByAccountRemoteId: getProductsByAccountRemoteIdMock,
      deleteProductByRemoteId: vi.fn(async () => {
        throw new Error("Not implemented for this test");
      }),
    },
    getProductsByAccountRemoteIdMock,
  };
};

const createInventoryRepository = (
  saveInventoryMovementMock: InventoryRepository["saveInventoryMovement"],
): InventoryRepository => ({
  getInventorySnapshotByAccountRemoteId: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
  getInventoryMovementsBySource: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
  saveInventoryMovement: saveInventoryMovementMock,
  saveInventoryMovements: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
  deleteInventoryMovementsByRemoteIds: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
});

describe("saveInventoryMovementUseCase", () => {
  it("rejects stock mutation for non-item products", async () => {
    const { productRepository } = createProductRepository([
      buildProduct({ kind: ProductKind.Service, stockQuantity: null }),
    ]);
    const saveInventoryMovementMock = vi.fn<
      InventoryRepository["saveInventoryMovement"]
    >(async () => {
      throw new Error("Should not be called");
    });
    const inventoryRepository = createInventoryRepository(saveInventoryMovementMock);

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository,
      productRepository,
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
      sourceRemoteId: "manual-1",
      sourceLineRemoteId: null,
      sourceAction: null,
      movementAt: Date.now(),
    });

    expect(result.success).toBe(false);
    expect(saveInventoryMovementMock).not.toHaveBeenCalled();
  });

  it("rejects movement that would reduce stock below zero", async () => {
    const { productRepository } = createProductRepository([
      buildProduct({ stockQuantity: 1 }),
    ]);
    const saveInventoryMovementMock = vi.fn<
      InventoryRepository["saveInventoryMovement"]
    >(async () => {
      throw new Error("Should not be called");
    });
    const inventoryRepository = createInventoryRepository(saveInventoryMovementMock);

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository,
      productRepository,
    });

    const result = await useCase.execute({
      remoteId: "move-1",
      accountRemoteId: "account-1",
      productRemoteId: "product-1",
      type: InventoryMovementType.SaleOut,
      quantity: 2,
      unitRate: 100,
      reason: null,
      remark: "Sale out",
      sourceModule: "pos",
      sourceRemoteId: "sale-1",
      sourceLineRemoteId: null,
      sourceAction: null,
      movementAt: Date.now(),
    });

    expect(result.success).toBe(false);
    expect(saveInventoryMovementMock).not.toHaveBeenCalled();
  });

  it("passes validated movement to repository", async () => {
    const { productRepository } = createProductRepository([
      buildProduct({ stockQuantity: 5 }),
    ]);
    const saveInventoryMovementMock = vi.fn<
      InventoryRepository["saveInventoryMovement"]
    >(async (payload: SaveInventoryMovementPayload) => ({
      success: true as const,
      value: {
        remoteId: payload.remoteId,
        accountRemoteId: payload.accountRemoteId,
        productRemoteId: payload.productRemoteId,
        productName: "Rice Bag",
        productUnitLabel: "bag",
        type: payload.type,
        quantity: payload.quantity,
        deltaQuantity:
          payload.type === InventoryMovementType.SaleOut
            ? payload.quantity * -1
            : payload.quantity,
        unitRate: payload.unitRate,
        totalValue:
          payload.unitRate === null ? null : payload.unitRate * payload.quantity,
        reason: payload.reason,
        remark: payload.remark,
        sourceModule: payload.sourceModule ?? null,
        sourceRemoteId: payload.sourceRemoteId ?? null,
        sourceLineRemoteId: payload.sourceLineRemoteId ?? null,
        sourceAction: payload.sourceAction ?? null,
        movementAt: payload.movementAt,
        createdAt: payload.movementAt,
        updatedAt: payload.movementAt,
      },
    }));
    const inventoryRepository = createInventoryRepository(saveInventoryMovementMock);

    const useCase = createSaveInventoryMovementUseCase({
      inventoryRepository,
      productRepository,
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
    expect(saveInventoryMovementMock).toHaveBeenCalledTimes(1);
    expect(saveInventoryMovementMock).toHaveBeenCalledWith(
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
