import { validatePosQuickProductForm } from "@/feature/pos/validation/validatePosQuickProductForm";
import { describe, expect, it } from "vitest";

describe("validatePosQuickProductForm", () => {
  it("requires product name and sale price", () => {
    const result = validatePosQuickProductForm({
      name: "",
      salePrice: "",
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
      }),
    ).toEqual({
      salePrice: "Sale price must be a valid number.",
    });

    expect(
      validatePosQuickProductForm({
        name: "Tea",
        salePrice: "-1",
      }),
    ).toEqual({
      salePrice: "Sale price cannot be negative.",
    });
  });

  it("allows zero as an explicit price", () => {
    const result = validatePosQuickProductForm({
      name: "Sample",
      salePrice: "0",
    });

    expect(result).toEqual({});
  });
});
