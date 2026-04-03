import { InventoryMovementModel } from "./inventoryMovement.model";
import { inventoryMovementsTable } from "./inventoryMovement.schema";

export const inventoryMovementDbConfig = {
  models: [InventoryMovementModel],
  tables: [inventoryMovementsTable],
};
