import { ProductDatasource } from "@/feature/products/data/dataSource/product.datasource";
import {
    ProductDatabaseError,
    ProductError,
    ProductNotFoundError,
    ProductUnknownError,
    ProductValidationError,
    SaveProductPayload,
} from "@/feature/products/types/product.types";
import { mapProductModelToDomain } from "./mapper/product.mapper";
import { ProductRepository } from "./product.repository";

const mapDatasourceError = (error: Error): ProductError => {
  const normalized = error.message.trim();
  const lower = normalized.toLowerCase();
  if (lower.includes("not found")) return ProductNotFoundError;
  if (lower.includes("required") || lower.includes("negative")) {
    return ProductValidationError(normalized);
  }
  if (
    lower.includes("database") ||
    lower.includes("schema") ||
    lower.includes("table") ||
    lower.includes("adapter")
  ) {
    return ProductDatabaseError;
  }
  return {
    ...ProductUnknownError,
    message: normalized || ProductUnknownError.message,
  };
};

export const createProductRepository = (
  datasource: ProductDatasource,
): ProductRepository => ({
  async saveProduct(payload: SaveProductPayload) {
    const result = await datasource.saveProduct(payload);
    if (!result.success)
      return { success: false, error: mapDatasourceError(result.error) };
    return { success: true, value: mapProductModelToDomain(result.value) };
  },
  async getProductsByAccountRemoteId(accountRemoteId: string) {
    const result =
      await datasource.getProductsByAccountRemoteId(accountRemoteId);
    if (!result.success)
      return { success: false, error: mapDatasourceError(result.error) };
    return { success: true, value: result.value.map(mapProductModelToDomain) };
  },
  async deleteProductByRemoteId(remoteId: string) {
    const result = await datasource.deleteProductByRemoteId(remoteId);
    if (!result.success)
      return { success: false, error: mapDatasourceError(result.error) };
    return result;
  },
});

