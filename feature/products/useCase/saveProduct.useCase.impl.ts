import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import {
  ProductKind,
  ProductValidationError,
} from "@/feature/products/types/product.types";
import { SaveProductUseCase } from "./saveProduct.useCase";

export const createSaveProductUseCase = (
  repository: ProductRepository,
): SaveProductUseCase => ({
  async execute(payload) {
    if (!payload.remoteId.trim()) {
      return {
        success: false,
        error: ProductValidationError("Product remote id is required."),
      };
    }

    if (!payload.accountRemoteId.trim()) {
      return {
        success: false,
        error: ProductValidationError("Account remote id is required."),
      };
    }

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

    if (
      payload.costPrice !== null &&
      Number.isFinite(payload.costPrice) &&
      payload.costPrice < 0
    ) {
      return {
        success: false,
        error: ProductValidationError("Cost price cannot be negative."),
      };
    }

    if (
      payload.kind !== ProductKind.Item &&
      payload.kind !== ProductKind.Service
    ) {
      return {
        success: false,
        error: ProductValidationError("Product type is invalid."),
      };
    }

    if (payload.kind === ProductKind.Service && payload.unitLabel !== null) {
      return {
        success: false,
        error: ProductValidationError(
          "Services cannot store an inventory unit label.",
        ),
      };
    }

    return repository.saveProduct(payload);
  },
});

