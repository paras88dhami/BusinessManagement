import {
  InventoryMovementsResult,
  InventorySourceLookupParams,
} from "@/feature/inventory/types/inventory.types";

export interface GetInventoryMovementsBySourceUseCase {
  execute(params: InventorySourceLookupParams): Promise<InventoryMovementsResult>;
}
