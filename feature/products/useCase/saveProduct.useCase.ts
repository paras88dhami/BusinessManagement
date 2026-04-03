import {
    ProductResult,
    SaveProductPayload,
} from "@/feature/products/types/product.types";

export interface SaveProductUseCase {
  execute(payload: SaveProductPayload): Promise<ProductResult>;
}

