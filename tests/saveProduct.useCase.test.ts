import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import {
  Product,
  ProductKind,
  ProductStatus,
  SaveProductPayload,
} from "@/feature/products/types/product.types";
import { createSaveProductUseCase } from "@/feature/products/useCase/saveProduct.useCase.impl";
import { describe, expect, it, vi } from "vitest";

const buildPayload = (overrides: Partial<SaveProductPayload> = {}): SaveProductPayload => ({
  remoteId: "  product-1  ",
  accountRemoteId: "  account-1  ",
  name: "  Apple  ",
  kind: ProductKind.Item,
  categoryName: "  General  ",
  salePrice: 100,
  costPrice: 50,
  unitLabel: "  pcs  ",
  skuOrBarcode: "  SKU-1  ",
  taxRateLabel: "  VAT 13%  ",
  description: "  test  ",
  imageUrl: "  image://1  ",
  status: ProductStatus.Active,
  ...overrides,
});

const buildProduct = (payload: SaveProductPayload): Product => ({
  remoteId: payload.remoteId,
  accountRemoteId: payload.accountRemoteId,
  name: payload.name,
  kind: payload.kind,
  categoryName: payload.categoryName,
  salePrice: payload.salePrice,
  costPrice: payload.costPrice,
  stockQuantity: null,
  unitLabel: payload.unitLabel,
  skuOrBarcode: payload.skuOrBarcode,
  taxRateLabel: payload.taxRateLabel,
  description: payload.description,
  imageUrl: payload.imageUrl,
  status: payload.status,
  createdAt: 1,
  updatedAt: 1,
});

const createRepository = (
  saveProductMock: ProductRepository["saveProduct"],
): ProductRepository => ({
  saveProduct: saveProductMock,
  getProductsByAccountRemoteId: vi.fn(async () => ({
    success: true as const,
    value: [],
  })),
  deleteProductByRemoteId: vi.fn(async () => ({
    success: true as const,
    value: true,
  })),
});

describe("saveProduct.useCase", () => {
  it("rejects item products without a unit label", async () => {
    const saveProductMock = vi.fn<ProductRepository["saveProduct"]>(
      async () => ({
        success: true as const,
        value: buildProduct(buildPayload()),
      }),
    );
    const repository = createRepository(saveProductMock);

    const useCase = createSaveProductUseCase(repository);
    const result = await useCase.execute(buildPayload({ unitLabel: "   " }));

    expect(result.success).toBe(false);
    expect(saveProductMock).not.toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.message).toBe(
        "Item products require a unit label.",
      );
    }
  });

  it("rejects services that try to store a unit label", async () => {
    const saveProductMock = vi.fn<ProductRepository["saveProduct"]>(
      async () => ({
        success: true as const,
        value: buildProduct(buildPayload()),
      }),
    );
    const repository = createRepository(saveProductMock);

    const useCase = createSaveProductUseCase(repository);
    const result = await useCase.execute(
      buildPayload({
        kind: ProductKind.Service,
        unitLabel: "pcs",
      }),
    );

    expect(result.success).toBe(false);
    expect(saveProductMock).not.toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.message).toBe(
        "Services cannot store an inventory unit label.",
      );
    }
  });

  it("normalizes trimmed payload values before saving", async () => {
    const saveProductMock = vi.fn<ProductRepository["saveProduct"]>(
      async (payload) => ({
        success: true as const,
        value: buildProduct(payload),
      }),
    );
    const repository = createRepository(saveProductMock);

    const useCase = createSaveProductUseCase(repository);
    const result = await useCase.execute(buildPayload());

    expect(result.success).toBe(true);
    expect(saveProductMock).toHaveBeenCalledWith(
      expect.objectContaining({
        remoteId: "product-1",
        accountRemoteId: "account-1",
        name: "Apple",
        categoryName: "General",
        unitLabel: "pcs",
        skuOrBarcode: "SKU-1",
        taxRateLabel: "VAT 13%",
        description: "test",
        imageUrl: "image://1",
      }),
    );
  });
});
