import {
    InventorySourceLookupParams,
    SaveInventoryMovementPayload
} from "@/feature/inventory/types/inventory.types";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import { RecordSyncStatus } from "@/feature/session/types/authSession.types";
import { Result } from "@/shared/types/result.types";
import { Database, Q } from "@nozbe/watermelondb";
import { InventoryMovementModel } from "./db/inventoryMovement.model";
import { InventoryDatasource } from "./inventory.datasource";

const PRODUCTS_TABLE = "products";
const INVENTORY_MOVEMENTS_TABLE = "inventory_movements";

const normalizeRequired = (value: string): string => value.trim();
const normalizeOptional = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const setCreatedAndUpdatedAt = (
  record: InventoryMovementModel | ProductModel,
  now: number,
): void => {
  (record as unknown as { _raw: Record<string, number> })._raw.created_at = now;
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const setUpdatedAt = (
  record: InventoryMovementModel | ProductModel,
  now: number,
): void => {
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const updateSyncStatusOnMutation = (
  record: InventoryMovementModel | ProductModel,
): void => {
  if (!record.recordSyncStatus || record.recordSyncStatus === RecordSyncStatus.Synced) {
    record.recordSyncStatus = RecordSyncStatus.PendingUpdate;
  }
};

const findProductByRemoteId = async (
  database: Database,
  remoteId: string,
): Promise<ProductModel | null> => {
  const collection = database.get<ProductModel>(PRODUCTS_TABLE);
  const matching = await collection
    .query(Q.where("remote_id", remoteId.trim()), Q.where("deleted_at", Q.eq(null)))
    .fetch();
  return matching[0] ?? null;
};

export const createLocalInventoryDatasource = (
  database: Database,
): InventoryDatasource => ({
  async getStockProductsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<ProductModel[]>> {
    try {
      const normalizedAccountRemoteId = normalizeRequired(accountRemoteId);
      if (!normalizedAccountRemoteId) {
        throw new Error("Account remote id is required");
      }

      const collection = database.get<ProductModel>(PRODUCTS_TABLE);
      const products = await collection
        .query(
          Q.where("account_remote_id", normalizedAccountRemoteId),
          Q.where("kind", "item"),
          Q.where("deleted_at", Q.eq(null)),
          Q.where("status", "active"),
          Q.sortBy("updated_at", Q.desc),
        )
        .fetch();

      return { success: true, value: products };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async getInventoryMovementsByAccountRemoteId(
    accountRemoteId: string,
    limit: number,
  ): Promise<Result<InventoryMovementModel[]>> {
    try {
      const normalizedAccountRemoteId = normalizeRequired(accountRemoteId);
      if (!normalizedAccountRemoteId) {
        throw new Error("Account remote id is required");
      }

      const collection = database.get<InventoryMovementModel>(
        INVENTORY_MOVEMENTS_TABLE,
      );
      const movements = await collection
        .query(
          Q.where("account_remote_id", normalizedAccountRemoteId),
          Q.where("deleted_at", Q.eq(null)),
          Q.sortBy("movement_at", Q.desc),
          Q.take(limit),
        )
        .fetch();

      return { success: true, value: movements };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async getInventoryMovementsBySource(
    params: InventorySourceLookupParams,
  ): Promise<Result<InventoryMovementModel[]>> {
    try {
      const normalizedAccountRemoteId = normalizeRequired(params.accountRemoteId);
      const normalizedSourceModule = normalizeRequired(params.sourceModule);
      const normalizedSourceRemoteId = normalizeRequired(params.sourceRemoteId);

      if (!normalizedAccountRemoteId) {
        throw new Error("Account remote id is required");
      }
      if (!normalizedSourceModule) {
        throw new Error("Inventory movement source module is required");
      }
      if (!normalizedSourceRemoteId) {
        throw new Error("Inventory movement source remote id is required");
      }

      const collection = database.get<InventoryMovementModel>(
        INVENTORY_MOVEMENTS_TABLE,
      );

      const movements = await collection
        .query(
          Q.where("account_remote_id", normalizedAccountRemoteId),
          Q.where("source_module", normalizedSourceModule),
          Q.where("source_remote_id", normalizedSourceRemoteId),
          Q.where("deleted_at", Q.eq(null)),
          Q.sortBy("movement_at", Q.asc),
          Q.sortBy("updated_at", Q.asc),
        )
        .fetch();

      return { success: true, value: movements };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async saveInventoryMovement(
    payload: SaveInventoryMovementPayload,
  ): Promise<Result<InventoryMovementModel>> {
    const result = await this.saveInventoryMovements([payload]);
    if (!result.success) {
      return result as Result<InventoryMovementModel>;
    }
    return { success: true, value: result.value[0] };
  },

  async saveInventoryMovements(
    payloads: SaveInventoryMovementPayload[],
  ): Promise<Result<InventoryMovementModel[]>> {
    try {
      const now = Date.now();
      const collection = database.get<InventoryMovementModel>(
        INVENTORY_MOVEMENTS_TABLE,
      );

      const createdMovements = await database.write(async () => {
        const movements: InventoryMovementModel[] = [];
        
        for (const payload of payloads) {
          const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId || '');
          const normalizedSourceModule = normalizeRequired(payload.sourceModule || '');
          const normalizedSourceRemoteId = normalizeRequired(payload.sourceRemoteId || '');
          const normalizedType = normalizeRequired(payload.type);
          const normalizedQuantity = payload.quantity.toString();
          const normalizedRemark = normalizeOptional(payload.remark || null);

          if (!normalizedAccountRemoteId) {
            throw new Error("Account remote id is required");
          }
          if (!normalizedSourceModule) {
            throw new Error("Inventory movement source module is required");
          }
          if (!normalizedSourceRemoteId) {
            throw new Error("Inventory movement source remote id is required");
          }
          if (!normalizedType) {
            throw new Error("Inventory movement type is required");
          }

          const product = await findProductByRemoteId(database, payload.productRemoteId);
          if (!product) {
            throw new Error(`Product with remote id ${payload.productRemoteId} not found`);
          }

          const record = await collection.create(record => {
            record.remoteId = payload.remoteId;
            record.accountRemoteId = normalizedAccountRemoteId;
            record.productRemoteId = payload.productRemoteId;
            record.sourceModule = normalizedSourceModule;
            record.sourceRemoteId = normalizedSourceRemoteId;
            record.sourceLineRemoteId = payload.sourceLineRemoteId || null;
            record.movementType = normalizedType as any;
            record.quantity = payload.quantity;
            record.reason = payload.reason;
            record.remark = normalizedRemark;
            record.movementAt = payload.movementAt;
            record.recordSyncStatus = RecordSyncStatus.PendingCreate;
            record.lastSyncedAt = null;
            record.deletedAt = null;
            setCreatedAndUpdatedAt(record, now);
          });
          
          movements.push(record);
        }
        
        return movements;
      });

      return { success: true, value: createdMovements };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async deleteInventoryMovementsByRemoteIds(
    remoteIds: readonly string[],
  ): Promise<Result<boolean>> {
    try {
      const normalizedRemoteIds = remoteIds
        .map(id => normalizeRequired(id))
        .filter(id => id.length > 0);
      
      if (normalizedRemoteIds.length === 0) {
        throw new Error("At least one valid remote id is required");
      }

      const collection = database.get<InventoryMovementModel>(
        INVENTORY_MOVEMENTS_TABLE,
      );

      await database.write(async () => {
        const movements = await collection
          .query(
            Q.where("remote_id", Q.oneOf(normalizedRemoteIds)),
            Q.where("deleted_at", Q.eq(null)),
          )
          .fetch();

        for (const movement of movements) {
          await movement.markAsDeleted();
          updateSyncStatusOnMutation(movement);
        }
      });

      return { success: true, value: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
