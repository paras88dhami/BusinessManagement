import { ProductKind } from "@/feature/products/types/product.types";
import { PosQuickProductFieldErrors } from "../types/pos.state.types";

type ValidatePosQuickProductFormParams = {
  name: string;
  salePrice: string;
  kind: string;
  openingStockQuantity: string;
};

export const validatePosQuickProductForm = ({
  name,
  salePrice,
  kind,
  openingStockQuantity,
}: ValidatePosQuickProductFormParams): PosQuickProductFieldErrors => {
  const nextFieldErrors: PosQuickProductFieldErrors = {};
  const normalizedName = name.trim();
  const normalizedSalePrice = salePrice.trim();
  const normalizedOpeningStock = openingStockQuantity.trim();

  if (!normalizedName) {
    nextFieldErrors.name = "Product name is required.";
  }

  if (!normalizedSalePrice) {
    nextFieldErrors.salePrice = "Sale price is required.";
  } else {
    const parsedSalePrice = Number(normalizedSalePrice.replace(/,/g, ""));
    if (!Number.isFinite(parsedSalePrice)) {
      nextFieldErrors.salePrice = "Sale price must be a valid number.";
    } else if (parsedSalePrice < 0) {
      nextFieldErrors.salePrice = "Sale price cannot be negative.";
    }
  }

  if (kind === ProductKind.Item && normalizedOpeningStock.length > 0) {
    const parsedOpeningStock = Number(normalizedOpeningStock.replace(/,/g, ""));
    if (!Number.isFinite(parsedOpeningStock)) {
      nextFieldErrors.openingStockQuantity =
        "Opening stock must be a valid number.";
    } else if (parsedOpeningStock < 0) {
      nextFieldErrors.openingStockQuantity =
        "Opening stock cannot be negative.";
    }
  }

  return nextFieldErrors;
};
