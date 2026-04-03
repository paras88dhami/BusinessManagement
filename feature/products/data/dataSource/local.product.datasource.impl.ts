import { SaveProductPayload } from "@/feature/products/types/product.types";
import { RecordSyncStatus } from "@/feature/session/types/authSession.types";
import { Result } from "@/shared/types/result.types";
import { Database, Q } from "@nozbe/watermelondb";
import { ProductModel } from "./db/product.model";
import { ProductDatasource } from "./product.datasource";

const PRODUCTS_TABLE = "products";

const normalizeRequired = (value: string): string => value.trim();
const normalizeOptional = (value: string | null): string | null => {
  if (value === null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const setCreatedAndUpdatedAt = (record: ProductModel, now: number) => {
  (record as unknown as { _raw: Record<string, number> })._raw.created_at = now;
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};
const setUpdatedAt = (record: ProductModel, now: number) => {
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};
const updateSyncStatusOnMutation = (record: ProductModel) => {
  if (
    !record.recordSyncStatus ||
    record.recordSyncStatus === RecordSyncStatus.Synced
  ) {
    record.recordSyncStatus = RecordSyncStatus.PendingUpdate;
  }
};

const findByRemoteId = async (
  database: Database,
  remoteId: string,
): Promise<ProductModel | null> => {
  const collection = database.get<ProductModel>(PRODUCTS_TABLE);
  const matching = await collection
    .query(Q.where("remote_id", remoteId.trim()))
    .fetch();
  return matching[0] ?? null;
};

export const createLocalProductDatasource = (
  database: Database,
): ProductDatasource => ({
  async saveProduct(
    payload: SaveProductPayload,
  ): Promise<Result<ProductModel>> {
    try {
      const normalizedRemoteId = normalizeRequired(payload.remoteId);
      const normalizedAccountRemoteId = normalizeRequired(
        payload.accountRemoteId,
      );
      const normalizedName = normalizeRequired(payload.name);
      const normalizedCategoryName = normalizeOptional(payload.categoryName);
      const normalizedUnitLabel = normalizeOptional(payload.unitLabel);
      const normalizedSkuOrBarcode = normalizeOptional(payload.skuOrBarcode);
      const normalizedTaxRateLabel = normalizeOptional(payload.taxRateLabel);
      const normalizedDescription = normalizeOptional(payload.description);
      const normalizedImageUrl = normalizeOptional(payload.imageUrl);

      if (!normalizedRemoteId) throw new Error("Product remote id is required");
      if (!normalizedAccountRemoteId)
        throw new Error("Account remote id is required");
      if (!normalizedName) throw new Error("Product name is required");
      if (!(payload.salePrice >= 0)) throw new Error("Sale price is required");
      if (
        payload.kind === "item" &&
        payload.stockQuantity !== null &&
        payload.stockQuantity < 0
      ) {
        throw new Error("Stock quantity cannot be negative");
      }

      const existingProduct = await findByRemoteId(
        database,
        normalizedRemoteId,
      );
      if (existingProduct) {
        await database.write(async () => {
          await existingProduct.update((record) => {
            record.accountRemoteId = normalizedAccountRemoteId;
            record.name = normalizedName;
            record.kind = payload.kind;
            record.categoryName = normalizedCategoryName;
            record.salePrice = payload.salePrice;
            record.costPrice = payload.costPrice;
            record.stockQuantity =
              payload.kind === "item" ? payload.stockQuantity : null;
            record.unitLabel =
              payload.kind === "item" ? normalizedUnitLabel : null;
            record.skuOrBarcode = normalizedSkuOrBarcode;
            record.taxRateLabel = normalizedTaxRateLabel;
            record.description = normalizedDescription;
            record.imageUrl = normalizedImageUrl;
            record.status = payload.status;
            updateSyncStatusOnMutation(record);
            setUpdatedAt(record, Date.now());
          });
        });
        return { success: true, value: existingProduct };
      }

      const collection = database.get<ProductModel>(PRODUCTS_TABLE);
      let created!: ProductModel;
      await database.write(async () => {
        created = await collection.create((record) => {
          const now = Date.now();
          record.remoteId = normalizedRemoteId;
          record.accountRemoteId = normalizedAccountRemoteId;
          record.name = normalizedName;
          record.kind = payload.kind;
          record.categoryName = normalizedCategoryName;
          record.salePrice = payload.salePrice;
          record.costPrice = payload.costPrice;
          record.stockQuantity =
            payload.kind === "item" ? payload.stockQuantity : null;
          record.unitLabel =
            payload.kind === "item" ? normalizedUnitLabel : null;
          record.skuOrBarcode = normalizedSkuOrBarcode;
          record.taxRateLabel = normalizedTaxRateLabel;
          record.description = normalizedDescription;
          record.imageUrl = normalizedImageUrl;
          record.status = payload.status;
          record.recordSyncStatus = RecordSyncStatus.PendingCreate;
          record.lastSyncedAt = null;
          record.deletedAt = null;
          setCreatedAndUpdatedAt(record, now);
        });
      });
      return { success: true, value: created };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async getProductsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<ProductModel[]>> {
    try {
      const normalizedAccountRemoteId = normalizeRequired(accountRemoteId);
      if (!normalizedAccountRemoteId)
        throw new Error("Account remote id is required");
      const collection = database.get<ProductModel>(PRODUCTS_TABLE);
      const products = await collection
        .query(
          Q.where("account_remote_id", normalizedAccountRemoteId),
          Q.where("deleted_at", Q.eq(null)),
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

  async deleteProductByRemoteId(remoteId: string): Promise<Result<boolean>> {
    try {
      const normalizedRemoteId = normalizeRequired(remoteId);
      if (!normalizedRemoteId) throw new Error("Product remote id is required");
      const existingProduct = await findByRemoteId(
        database,
        normalizedRemoteId,
      );
      if (!existingProduct) throw new Error("Product not found");
      await database.write(async () => {
        await existingProduct.update((record) => {
          record.deletedAt = Date.now();
          record.status = "inactive";
          updateSyncStatusOnMutation(record);
          setUpdatedAt(record, Date.now());
        });
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

