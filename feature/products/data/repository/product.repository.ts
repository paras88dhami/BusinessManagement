import {
    ProductOperationResult,
    ProductResult,
    ProductsResult,
    SaveProductPayload,
} from "@/feature/products/types/product.types";

export interface ProductRepository {
  saveProduct(payload: SaveProductPayload): Promise<ProductResult>;
  getProductsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<ProductsResult>;
  deleteProductByRemoteId(remoteId: string): Promise<ProductOperationResult>;
}

