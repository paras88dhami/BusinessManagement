import { InventoryOperationResult } from "@/feature/inventory/types/inventory.types";

export interface DeleteInventoryMovementsByRemoteIdsUseCase {
  execute(remoteIds: readonly string[]): Promise<InventoryOperationResult>;
}
