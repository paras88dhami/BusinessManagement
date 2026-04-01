import { PosProduct } from "../types/pos.entity.types";

export const formatCurrency = (amount: number): string => {
  return `NPR ${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const buildSlotProductLookup = (
  products: readonly PosProduct[],
): Record<string, PosProduct> => {
  return products.reduce<Record<string, PosProduct>>((lookup, product) => {
    lookup[product.id] = product;
    return lookup;
  }, {});
};
