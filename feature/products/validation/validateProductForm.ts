import {
  ProductFormFieldErrors,
  ProductFormState,
  ProductKind,
} from "@/feature/products/types/product.types";

type ValidateProductFormParams = {
  mode: "create" | "edit";
  form: ProductFormState;
};

const parseNumberInput = (value: string): number | null => {
  const normalizedValue = value.trim().replace(/,/g, "");
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const validateProductForm = ({
  mode,
  form,
}: ValidateProductFormParams): ProductFormFieldErrors => {
  const nextFieldErrors: ProductFormFieldErrors = {};
  const normalizedName = form.name.trim();
  const normalizedSalePrice = form.salePrice.trim();
  const normalizedCostPrice = form.costPrice.trim();
  const normalizedOpeningStockQuantity = form.openingStockQuantity.trim();
  const normalizedUnitLabel = form.unitLabel.trim();
  const isItemKind = form.kind === ProductKind.Item;

  if (!normalizedName) {
    nextFieldErrors.name = "Product name is required.";
  }

  if (!normalizedSalePrice) {
    nextFieldErrors.salePrice = "Sale price is required.";
  } else {
    const parsedSalePrice = parseNumberInput(form.salePrice);
    if (parsedSalePrice === null) {
      nextFieldErrors.salePrice = "Sale price must be a valid number.";
    } else if (parsedSalePrice < 0) {
      nextFieldErrors.salePrice = "Sale price cannot be negative.";
    }
  }

  if (normalizedCostPrice.length > 0) {
    const parsedCostPrice = parseNumberInput(form.costPrice);
    if (parsedCostPrice === null) {
      nextFieldErrors.costPrice = "Cost price must be a valid number.";
    } else if (parsedCostPrice < 0) {
      nextFieldErrors.costPrice = "Cost price cannot be negative.";
    }
  }

  if (isItemKind && !normalizedUnitLabel) {
    nextFieldErrors.unitLabel = "Unit is required for item products.";
  }

  if (
    mode === "create" &&
    isItemKind &&
    normalizedOpeningStockQuantity.length > 0
  ) {
    const parsedOpeningStock = parseNumberInput(form.openingStockQuantity);
    if (parsedOpeningStock === null) {
      nextFieldErrors.openingStockQuantity =
        "Opening stock must be a valid number.";
    } else if (parsedOpeningStock < 0) {
      nextFieldErrors.openingStockQuantity =
        "Opening stock cannot be negative.";
    }
  }

  return nextFieldErrors;
};
