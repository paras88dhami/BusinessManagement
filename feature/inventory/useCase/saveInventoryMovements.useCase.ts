import {
  InventoryMovementsResult,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";

export interface SaveInventoryMovementsUseCase {
  execute(
    payloads: readonly SaveInventoryMovementPayload[],
  ): Promise<InventoryMovementsResult>;
}
