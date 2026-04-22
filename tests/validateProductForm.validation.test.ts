import {
  ProductFormState,
  ProductKind,
} from "@/feature/products/types/product.types";
import { validateProductForm } from "@/feature/products/validation/validateProductForm";
import { describe, expect, it } from "vitest";

const buildForm = (
  overrides: Partial<ProductFormState> = {},
): ProductFormState => ({
  remoteId: null,
  name: "Apple",
  kind: ProductKind.Item,
  categoryName: "",
  salePrice: "100",
  costPrice: "50",
  unitLabel: "pcs",
  skuOrBarcode: "",
  taxRateLabel: "VAT 13%",
  description: "",
  imageUrl: "",
  openingStockQuantity: "10",
  ...overrides,
});

describe("validateProductForm", () => {
  it("returns inline field errors for missing required item fields", () => {
    const result = validateProductForm({
      mode: "create",
      form: buildForm({
        name: "",
        salePrice: "",
        unitLabel: "",
      }),
    });

    expect(result).toEqual({
      name: "Product name is required.",
      salePrice: "Sale price is required.",
      unitLabel: "Unit is required for item products.",
    });
  });

  it("returns inline field errors for invalid numeric fields", () => {
    const result = validateProductForm({
      mode: "create",
      form: buildForm({
        salePrice: "abc",
        costPrice: "-5",
        openingStockQuantity: "x",
      }),
    });

    expect(result).toEqual({
      salePrice: "Sale price must be a valid number.",
      costPrice: "Cost price cannot be negative.",
      openingStockQuantity: "Opening stock must be a valid number.",
    });
  });

  it("ignores item-only fields for services", () => {
    const result = validateProductForm({
      mode: "create",
      form: buildForm({
        kind: ProductKind.Service,
        unitLabel: "",
        openingStockQuantity: "25",
      }),
    });

    expect(result).toEqual({});
  });
});
