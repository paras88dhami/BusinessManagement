import {
    InventorySourceLookupParams,
    SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import { Result } from "@/shared/types/result.types";
import { InventoryMovementModel } from "./db/inventoryMovement.model";

export interface InventoryDatasource {
  getStockProductsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<ProductModel[]>>;

  getInventoryMovementsByAccountRemoteId(
    accountRemoteId: string,
    limit: number,
  ): Promise<Result<InventoryMovementModel[]>>;

  getInventoryMovementsBySource(
    params: InventorySourceLookupParams,
  ): Promise<Result<InventoryMovementModel[]>>;

  saveInventoryMovement(
    payload: SaveInventoryMovementPayload,
  ): Promise<Result<InventoryMovementModel>>;

  saveInventoryMovements(
    payloads: readonly SaveInventoryMovementPayload[],
  ): Promise<Result<InventoryMovementModel[]>>;

  deleteInventoryMovementsByRemoteIds(
    remoteIds: readonly string[],
  ): Promise<Result<boolean>>;
}
