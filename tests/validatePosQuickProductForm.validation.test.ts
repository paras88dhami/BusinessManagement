import { ProductKind } from "@/feature/products/types/product.types";
import { validatePosQuickProductForm } from "@/feature/pos/validation/validatePosQuickProductForm";
import { describe, expect, it } from "vitest";

describe("validatePosQuickProductForm", () => {
  it("requires product name and sale price", () => {
    const result = validatePosQuickProductForm({
      name: "",
      salePrice: "",
      kind: ProductKind.Item,
      openingStockQuantity: "",
    });

    expect(result).toEqual({
      name: "Product name is required.",
      salePrice: "Sale price is required.",
    });
  });

  it("rejects invalid and negative sale prices", () => {
    expect(
      validatePosQuickProductForm({
        name: "Tea",
        salePrice: "abc",
        kind: ProductKind.Item,
        openingStockQuantity: "",
      }),
    ).toEqual({
      salePrice: "Sale price must be a valid number.",
    });

    expect(
      validatePosQuickProductForm({
        name: "Tea",
        salePrice: "-1",
        kind: ProductKind.Item,
        openingStockQuantity: "",
      }),
    ).toEqual({
      salePrice: "Sale price cannot be negative.",
    });
  });

  it("validates opening stock only for item products", () => {
    expect(
      validatePosQuickProductForm({
        name: "Rice",
        salePrice: "100",
        kind: ProductKind.Item,
        openingStockQuantity: "abc",
      }),
    ).toEqual({
      openingStockQuantity: "Opening stock must be a valid number.",
    });

    expect(
      validatePosQuickProductForm({
        name: "Rice",
        salePrice: "100",
        kind: ProductKind.Item,
        openingStockQuantity: "-1",
      }),
    ).toEqual({
      openingStockQuantity: "Opening stock cannot be negative.",
    });

    expect(
      validatePosQuickProductForm({
        name: "Haircut",
        salePrice: "500",
        kind: ProductKind.Service,
        openingStockQuantity: "abc",
      }),
    ).toEqual({});
  });

  it("allows valid payloads", () => {
    const result = validatePosQuickProductForm({
      name: "Sample",
      salePrice: "0",
      kind: ProductKind.Item,
      openingStockQuantity: "5",
    });

    expect(result).toEqual({});
  });
});
