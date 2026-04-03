import { ProductOperationResult } from "@/feature/products/types/product.types";

export interface DeleteProductUseCase {
  execute(remoteId: string): Promise<ProductOperationResult>;
}

