import { Database, Q } from "@nozbe/watermelondb";
import { InventoryDatasource } from "./inventory.datasource";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import { InventoryMovementModel } from "./db/inventoryMovement.model";
import {
  InventoryMovementType,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import { Result } from "@/shared/types/result.types";
import { RecordSyncStatus } from "@/feature/session/types/authSession.types";

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

  async saveInventoryMovement(
    payload: SaveInventoryMovementPayload,
  ): Promise<Result<InventoryMovementModel>> {
    try {
      const normalizedRemoteId = normalizeRequired(payload.remoteId);
      const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
      const normalizedProductRemoteId = normalizeRequired(payload.productRemoteId);
      const normalizedRemark = normalizeOptional(payload.remark);

      if (!normalizedRemoteId) {
        throw new Error("Inventory movement remote id is required");
      }
      if (!normalizedAccountRemoteId) {
        throw new Error("Account remote id is required");
      }
      if (!normalizedProductRemoteId) {
        throw new Error("Product is required");
      }
      if (!(payload.quantity > 0)) {
        throw new Error("Quantity must be greater than zero");
      }
      if (
        payload.type === InventoryMovementType.StockIn &&
        payload.unitRate !== null &&
        payload.unitRate < 0
      ) {
        throw new Error("Rate cannot be negative");
      }

      const product = await findProductByRemoteId(database, normalizedProductRemoteId);
      if (!product) {
        throw new Error("Product not found");
      }
      if (product.accountRemoteId !== normalizedAccountRemoteId) {
        throw new Error("Selected product does not belong to this account");
      }
      if (product.kind !== "item") {
        throw new Error("Inventory is available only for item products");
      }

      const currentStock = product.stockQuantity ?? 0;
      const deltaQuantity =
        payload.type === InventoryMovementType.StockIn
          ? payload.quantity
          : payload.quantity * -1;
      const nextStock = currentStock + deltaQuantity;

      if (nextStock < 0) {
        throw new Error("Adjustment cannot reduce stock below zero");
      }

      const movementCollection = database.get<InventoryMovementModel>(
        INVENTORY_MOVEMENTS_TABLE,
      );
      let createdMovement!: InventoryMovementModel;
      const now = Date.now();
      await database.write(async () => {
        await product.update((record) => {
          record.stockQuantity = nextStock;
          if (
            payload.type === InventoryMovementType.StockIn &&
            payload.unitRate !== null
          ) {
            record.costPrice = payload.unitRate;
          }
          updateSyncStatusOnMutation(record);
          setUpdatedAt(record, now);
        });

        createdMovement = await movementCollection.create((record) => {
          record.remoteId = normalizedRemoteId;
          record.accountRemoteId = normalizedAccountRemoteId;
          record.productRemoteId = normalizedProductRemoteId;
          record.productNameSnapshot = product.name;
          record.productUnitLabelSnapshot = product.unitLabel;
          record.movementType = payload.type;
          record.quantity = payload.quantity;
          record.deltaQuantity = deltaQuantity;
          record.unitRate = payload.unitRate;
          record.reason = payload.reason;
          record.remark = normalizedRemark;
          record.movementAt = payload.movementAt;
          record.recordSyncStatus = RecordSyncStatus.PendingCreate;
          record.lastSyncedAt = null;
          record.deletedAt = null;
          setCreatedAndUpdatedAt(record, now);
        });
      });

      return { success: true, value: createdMovement };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
