import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import { SaveInventoryMovementsUseCase } from "./saveInventoryMovements.useCase";

export const createSaveInventoryMovementsUseCase = (
  repository: InventoryRepository,
): SaveInventoryMovementsUseCase => ({
  execute(payloads) {
    return repository.saveInventoryMovements(payloads);
  },
});
