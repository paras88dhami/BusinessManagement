import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import { ProductValidationError } from "@/feature/products/types/product.types";
import { SaveProductUseCase } from "./saveProduct.useCase";

export const createSaveProductUseCase = (
  repository: ProductRepository,
): SaveProductUseCase => ({
  async execute(payload) {
    if (!payload.name.trim()) {
      return {
        success: false,
        error: ProductValidationError("Product name is required."),
      };
    }
    if (payload.salePrice < 0) {
      return {
        success: false,
        error: ProductValidationError("Sale price cannot be negative."),
      };
    }
    return repository.saveProduct(payload);
  },
});

