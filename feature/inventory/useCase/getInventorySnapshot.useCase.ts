import { InventorySnapshotResult } from "@/feature/inventory/types/inventory.types";

export interface GetInventorySnapshotUseCase {
  execute(accountRemoteId: string): Promise<InventorySnapshotResult>;
}
