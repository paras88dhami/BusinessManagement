import {
    InventoryMovementResult,
    InventoryMovementsResult,
    InventoryOperationResult,
    InventorySnapshotResult,
    InventorySourceLookupParams,
    SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";

export interface InventoryRepository {
  getInventorySnapshotByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<InventorySnapshotResult>;

  getInventoryMovementsBySource(
    params: InventorySourceLookupParams,
  ): Promise<InventoryMovementsResult>;

  saveInventoryMovement(
    payload: SaveInventoryMovementPayload,
  ): Promise<InventoryMovementResult>;

  saveInventoryMovements(
    payloads: readonly SaveInventoryMovementPayload[],
  ): Promise<InventoryMovementsResult>;

  deleteInventoryMovementsByRemoteIds(
    remoteIds: readonly string[],
  ): Promise<InventoryOperationResult>;
}
