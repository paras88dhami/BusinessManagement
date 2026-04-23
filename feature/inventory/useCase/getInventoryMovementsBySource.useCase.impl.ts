import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import {
  InventoryValidationError,
  type InventorySourceLookupParams,
} from "@/feature/inventory/types/inventory.types";
import { GetInventoryMovementsBySourceUseCase } from "./getInventoryMovementsBySource.useCase";

export const createGetInventoryMovementsBySourceUseCase = (
  repository: InventoryRepository,
): GetInventoryMovementsBySourceUseCase => ({
  async execute(params: InventorySourceLookupParams) {
    const accountRemoteId = params.accountRemoteId.trim();
    const sourceModule = params.sourceModule.trim();
    const sourceRemoteId = params.sourceRemoteId.trim();

    if (!accountRemoteId) {
      return {
        success: false,
        error: InventoryValidationError("Account remote id is required."),
      };
    }

    if (!sourceModule) {
      return {
        success: false,
        error: InventoryValidationError(
          "Inventory movement source module is required.",
        ),
      };
    }

    if (!sourceRemoteId) {
      return {
        success: false,
        error: InventoryValidationError(
          "Inventory movement source remote id is required.",
        ),
      };
    }

    return repository.getInventoryMovementsBySource({
      accountRemoteId,
      sourceModule,
      sourceRemoteId,
    });
  },
});
