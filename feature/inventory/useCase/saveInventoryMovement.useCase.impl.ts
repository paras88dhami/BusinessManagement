import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import { SaveInventoryMovementUseCase } from "./saveInventoryMovement.useCase";

export const createSaveInventoryMovementUseCase = (
  repository: InventoryRepository,
): SaveInventoryMovementUseCase => ({
  execute(payload) {
    return repository.saveInventoryMovement(payload);
  },
});
