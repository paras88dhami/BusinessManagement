import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import {
  InventoryMovementType,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import { createSaveInventoryMovementsUseCase } from "@/feature/inventory/useCase/saveInventoryMovements.useCase.impl";
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
  saveInventoryMovementsMock: InventoryRepository["saveInventoryMovements"],
): InventoryRepository => ({
  getInventorySnapshotByAccountRemoteId: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
  getInventoryMovementsBySource: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
  saveInventoryMovement: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
  saveInventoryMovements: saveInventoryMovementsMock,
  deleteInventoryMovementsByRemoteIds: vi.fn(async () => {
    throw new Error("Not implemented for this test");
  }),
});

describe("saveInventoryMovementsUseCase", () => {
  it("rejects mixed-account batch", async () => {
    const { productRepository } = createProductRepository([buildProduct()]);
    const saveInventoryMovementsMock = vi.fn<
      InventoryRepository["saveInventoryMovements"]
    >(async () => {
      throw new Error("Should not be called");
    });
    const inventoryRepository = createInventoryRepository(saveInventoryMovementsMock);

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository,
      productRepository,
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
    expect(saveInventoryMovementsMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate movement ids in batch", async () => {
    const { productRepository } = createProductRepository([buildProduct()]);
    const saveInventoryMovementsMock = vi.fn<
      InventoryRepository["saveInventoryMovements"]
    >(async () => {
      throw new Error("Should not be called");
    });
    const inventoryRepository = createInventoryRepository(saveInventoryMovementsMock);

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository,
      productRepository,
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
    expect(saveInventoryMovementsMock).not.toHaveBeenCalled();
  });

  it("passes validated batch to repository", async () => {
    const { productRepository } = createProductRepository([
      buildProduct({ remoteId: "product-1", stockQuantity: 10 }),
      buildProduct({ remoteId: "product-2", stockQuantity: 3, name: "Tea Box" }),
    ]);
    const saveInventoryMovementsMock = vi.fn<
      InventoryRepository["saveInventoryMovements"]
    >(async (payloads: readonly SaveInventoryMovementPayload[]) => ({
      success: true as const,
      value: payloads.map((payload) => ({
        remoteId: payload.remoteId,
        accountRemoteId: payload.accountRemoteId,
        productRemoteId: payload.productRemoteId,
        productName: "Mock Product",
        productUnitLabel: "unit",
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
      })),
    }));
    const inventoryRepository = createInventoryRepository(saveInventoryMovementsMock);

    const useCase = createSaveInventoryMovementsUseCase({
      inventoryRepository,
      productRepository,
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
    expect(saveInventoryMovementsMock).toHaveBeenCalledTimes(1);
    expect(saveInventoryMovementsMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          remoteId: "move-1",
          accountRemoteId: "account-1",
          productRemoteId: "product-1",
        }),
        expect.objectContaining({
          remoteId: "move-2",
          accountRemoteId: "account-1",
          productRemoteId: "product-2",
        }),
      ]),
    );
  });
});
