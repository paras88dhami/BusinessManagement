import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import { GetInventoryMovementsBySourceUseCase } from "./getInventoryMovementsBySource.useCase";

export const createGetInventoryMovementsBySourceUseCase = (
  repository: InventoryRepository,
): GetInventoryMovementsBySourceUseCase => ({
  execute(params) {
    return repository.getInventoryMovementsBySource(params);
  },
});
