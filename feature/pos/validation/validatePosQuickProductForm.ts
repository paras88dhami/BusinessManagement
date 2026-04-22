import { PosQuickProductFieldErrors } from "../types/pos.state.types";

type ValidatePosQuickProductFormParams = {
  name: string;
  salePrice: string;
};

export const validatePosQuickProductForm = ({
  name,
  salePrice,
}: ValidatePosQuickProductFormParams): PosQuickProductFieldErrors => {
  const nextFieldErrors: PosQuickProductFieldErrors = {};
  const normalizedName = name.trim();
  const normalizedSalePrice = salePrice.trim();

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

  return nextFieldErrors;
};
