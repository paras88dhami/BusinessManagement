import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import { DeleteInventoryMovementsByRemoteIdsUseCase } from "./deleteInventoryMovementsByRemoteIds.useCase";

export const createDeleteInventoryMovementsByRemoteIdsUseCase = (
  repository: InventoryRepository,
): DeleteInventoryMovementsByRemoteIdsUseCase => ({
  execute(remoteIds) {
    return repository.deleteInventoryMovementsByRemoteIds(remoteIds);
  },
});
