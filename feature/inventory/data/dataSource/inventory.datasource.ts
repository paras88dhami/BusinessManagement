import { Result } from "@/shared/types/result.types";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import { InventoryMovementModel } from "./db/inventoryMovement.model";
import { SaveInventoryMovementPayload } from "@/feature/inventory/types/inventory.types";

export interface InventoryDatasource {
  getStockProductsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<ProductModel[]>>;
  getInventoryMovementsByAccountRemoteId(
    accountRemoteId: string,
    limit: number,
  ): Promise<Result<InventoryMovementModel[]>>;
  saveInventoryMovement(
    payload: SaveInventoryMovementPayload,
  ): Promise<Result<InventoryMovementModel>>;
}
