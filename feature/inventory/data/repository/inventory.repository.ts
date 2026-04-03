import {
  InventoryMovementResult,
  InventorySnapshotResult,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";

export interface InventoryRepository {
  getInventorySnapshotByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<InventorySnapshotResult>;
  saveInventoryMovement(
    payload: SaveInventoryMovementPayload,
  ): Promise<InventoryMovementResult>;
}
