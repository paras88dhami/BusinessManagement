import { InventoryDatasource } from "@/feature/inventory/data/dataSource/inventory.datasource";
import {
    InventoryDatabaseError,
    InventoryError,
    InventoryMovementsResult,
    InventoryOperationResult,
    InventoryProductNotFoundError,
    InventorySourceLookupParams,
    InventoryUnknownError,
    InventoryValidationError,
    SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
import { InventoryRepository } from "./inventory.repository";
import {
    mapInventoryMovementModelToDomain,
    mapProductModelToInventoryStockItem,
} from "./mapper/inventory.mapper";

const mapDatasourceError = (error: Error): InventoryError => {
  const normalized = error.message.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes("not found")) {
    return InventoryProductNotFoundError;
  }

  if (
    lower.includes("required") ||
    lower.includes("negative") ||
    lower.includes("greater than zero") ||
    lower.includes("below zero") ||
    lower.includes("does not belong") ||
    lower.includes("only for item")
  ) {
    return InventoryValidationError(normalized);
  }

  if (
    lower.includes("database") ||
    lower.includes("schema") ||
    lower.includes("table") ||
    lower.includes("adapter")
  ) {
    return InventoryDatabaseError;
  }

  return {
    ...InventoryUnknownError,
    message: normalized || InventoryUnknownError.message,
  };
};

export const createInventoryRepository = (
  datasource: InventoryDatasource,
): InventoryRepository => ({
  async getInventorySnapshotByAccountRemoteId(accountRemoteId: string) {
    const [productsResult, movementsResult] = await Promise.all([
      datasource.getStockProductsByAccountRemoteId(accountRemoteId),
      datasource.getInventoryMovementsByAccountRemoteId(accountRemoteId, 8),
    ]);

    if (!productsResult.success) {
      return { success: false, error: mapDatasourceError(productsResult.error) };
    }

    if (!movementsResult.success) {
      return { success: false, error: mapDatasourceError(movementsResult.error) };
    }

    return {
      success: true,
      value: {
        stockItems: productsResult.value.map(mapProductModelToInventoryStockItem),
        recentMovements: movementsResult.value.map(mapInventoryMovementModelToDomain),
      },
    };
  },

  async getInventoryMovementsBySource(
    params: InventorySourceLookupParams,
  ): Promise<InventoryMovementsResult> {
    const result = await datasource.getInventoryMovementsBySource(params);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return {
      success: true,
      value: result.value.map(mapInventoryMovementModelToDomain),
    };
  },

  async saveInventoryMovement(payload: SaveInventoryMovementPayload) {
    const result = await datasource.saveInventoryMovement(payload);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return { success: true, value: mapInventoryMovementModelToDomain(result.value) };
  },

  async saveInventoryMovements(
    payloads: readonly SaveInventoryMovementPayload[],
  ): Promise<InventoryMovementsResult> {
    const result = await datasource.saveInventoryMovements(payloads);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return {
      success: true,
      value: result.value.map(mapInventoryMovementModelToDomain),
    };
  },

  async deleteInventoryMovementsByRemoteIds(
    remoteIds: readonly string[],
  ): Promise<InventoryOperationResult> {
    const result = await datasource.deleteInventoryMovementsByRemoteIds(remoteIds);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return result;
  },
});
