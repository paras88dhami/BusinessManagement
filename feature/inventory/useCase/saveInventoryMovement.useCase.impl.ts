import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import { InventoryValidationError } from "@/feature/inventory/types/inventory.types";
import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import { SaveInventoryMovementUseCase } from "./saveInventoryMovement.useCase";
import { validateInventoryMovementPayloadsForSave } from "../utils/inventoryMutationPolicy.util";

export const createSaveInventoryMovementUseCase = (params: {
  inventoryRepository: InventoryRepository;
  productRepository: ProductRepository;
}): SaveInventoryMovementUseCase => ({
  async execute(payload) {
    const normalizedAccountRemoteId = payload.accountRemoteId.trim();

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
        payloads: [payload],
        products: productsResult.value,
      });

      return params.inventoryRepository.saveInventoryMovement(validatedPayloads[0]);
    } catch (error) {
      return {
        success: false,
        error: InventoryValidationError(
          error instanceof Error ? error.message : "Invalid inventory movement",
        ),
      };
    }
  },
});
