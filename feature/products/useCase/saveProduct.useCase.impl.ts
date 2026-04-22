import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import {
  ProductKind,
  ProductValidationError,
} from "@/feature/products/types/product.types";
import { SaveProductUseCase } from "./saveProduct.useCase";

const normalizeNullableText = (
  value: string | null | undefined,
): string | null => {
  const normalizedValue = value?.trim() ?? "";
  return normalizedValue.length > 0 ? normalizedValue : null;
};

export const createSaveProductUseCase = (
  repository: ProductRepository,
): SaveProductUseCase => ({
  async execute(payload) {
    const normalizedPayload = {
      ...payload,
      remoteId: payload.remoteId.trim(),
      accountRemoteId: payload.accountRemoteId.trim(),
      name: payload.name.trim(),
      categoryName: normalizeNullableText(payload.categoryName),
      unitLabel: normalizeNullableText(payload.unitLabel),
      skuOrBarcode: normalizeNullableText(payload.skuOrBarcode),
      taxRateLabel: normalizeNullableText(payload.taxRateLabel),
      description: normalizeNullableText(payload.description),
      imageUrl: normalizeNullableText(payload.imageUrl),
    };

    if (!normalizedPayload.remoteId) {
      return {
        success: false,
        error: ProductValidationError("Product remote id is required."),
      };
    }

    if (!normalizedPayload.accountRemoteId) {
      return {
        success: false,
        error: ProductValidationError("Account remote id is required."),
      };
    }

    if (!normalizedPayload.name) {
      return {
        success: false,
        error: ProductValidationError("Product name is required."),
      };
    }

    if (!Number.isFinite(normalizedPayload.salePrice)) {
      return {
        success: false,
        error: ProductValidationError("Sale price must be a valid number."),
      };
    }

    if (normalizedPayload.salePrice < 0) {
      return {
        success: false,
        error: ProductValidationError("Sale price cannot be negative."),
      };
    }

    if (
      normalizedPayload.costPrice !== null &&
      !Number.isFinite(normalizedPayload.costPrice)
    ) {
      return {
        success: false,
        error: ProductValidationError("Cost price must be a valid number."),
      };
    }

    if (
      normalizedPayload.costPrice !== null &&
      normalizedPayload.costPrice < 0
    ) {
      return {
        success: false,
        error: ProductValidationError("Cost price cannot be negative."),
      };
    }

    if (
      normalizedPayload.kind !== ProductKind.Item &&
      normalizedPayload.kind !== ProductKind.Service
    ) {
      return {
        success: false,
        error: ProductValidationError("Product type is invalid."),
      };
    }

    if (
      normalizedPayload.kind === ProductKind.Item &&
      !normalizedPayload.unitLabel
    ) {
      return {
        success: false,
        error: ProductValidationError(
          "Item products require a unit label.",
        ),
      };
    }

    if (
      normalizedPayload.kind === ProductKind.Service &&
      normalizedPayload.unitLabel !== null
    ) {
      return {
        success: false,
        error: ProductValidationError(
          "Services cannot store an inventory unit label.",
        ),
      };
    }

    return repository.saveProduct(normalizedPayload);
  },
});
