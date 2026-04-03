import { ProductsResult } from "@/feature/products/types/product.types";

export interface GetProductsUseCase {
  execute(accountRemoteId: string): Promise<ProductsResult>;
}

