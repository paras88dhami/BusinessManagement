import { InventoryRepository } from "@/feature/inventory/data/repository/inventory.repository";
import { GetInventorySnapshotUseCase } from "./getInventorySnapshot.useCase";

export const createGetInventorySnapshotUseCase = (
  repository: InventoryRepository,
): GetInventorySnapshotUseCase => ({
  execute(accountRemoteId: string) {
    return repository.getInventorySnapshotByAccountRemoteId(accountRemoteId);
  },
});
