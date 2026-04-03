import {
  InventoryMovementResult,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";

export interface SaveInventoryMovementUseCase {
  execute(payload: SaveInventoryMovementPayload): Promise<InventoryMovementResult>;
}
