import { InventoryDatasource } from "@/feature/inventory/data/dataSource/inventory.datasource";
import { InventoryRepository } from "./inventory.repository";
import {
  InventoryDatabaseError,
  InventoryError,
  InventoryProductNotFoundError,
  InventoryUnknownError,
  InventoryValidationError,
  SaveInventoryMovementPayload,
} from "@/feature/inventory/types/inventory.types";
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
  async saveInventoryMovement(payload: SaveInventoryMovementPayload) {
    const result = await datasource.saveInventoryMovement(payload);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return { success: true, value: mapInventoryMovementModelToDomain(result.value) };
  },
});
