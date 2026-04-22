import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import { InventoryValidationError } from "@/feature/inventory/types/inventory.types";
import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import { SaveInventoryMovementsUseCase } from "./saveInventoryMovements.useCase";
import { validateInventoryMovementPayloadsForSave } from "../utils/inventoryMutationPolicy.util";

export const createSaveInventoryMovementsUseCase = (params: {
  inventoryRepository: InventoryRepository;
  productRepository: ProductRepository;
}): SaveInventoryMovementsUseCase => ({
  async execute(payloads) {
    if (payloads.length === 0) {
      return {
        success: false,
        error: InventoryValidationError(
          "At least one inventory movement payload is required.",
        ),
      };
    }

    const normalizedAccountRemoteId = payloads[0].accountRemoteId.trim();

    if (!normalizedAccountRemoteId) {
      return {
        success: false,
        error: InventoryValidationError("Account remote id is required."),
      };
    }

    const productsResult =
      await params.productRepository.getProductsByAccountRemoteId(
        normalizedAccountRemoteId,
      );

    if (!productsResult.success) {
      return {
        success: false,
        error: InventoryValidationError(productsResult.error.message),
      };
    }

    try {
      const validatedPayloads = validateInventoryMovementPayloadsForSave({
        payloads,
        products: productsResult.value,
      });

      return params.inventoryRepository.saveInventoryMovements(validatedPayloads);
    } catch (error) {
      return {
        success: false,
        error: InventoryValidationError(
          error instanceof Error ? error.message : "Invalid inventory movements",
        ),
      };
    }
  },
});
