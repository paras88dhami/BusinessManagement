import { SaveProductPayload } from "@/feature/products/types/product.types";
import { Result } from "@/shared/types/result.types";
import { ProductModel } from "./db/product.model";

export interface ProductDatasource {
  saveProduct(payload: SaveProductPayload): Promise<Result<ProductModel>>;
  getProductsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<ProductModel[]>>;
  deleteProductByRemoteId(remoteId: string): Promise<Result<boolean>>;
}

