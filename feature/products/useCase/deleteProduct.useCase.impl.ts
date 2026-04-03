import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import { DeleteProductUseCase } from "./deleteProduct.useCase";

export const createDeleteProductUseCase = (
  repository: ProductRepository,
): DeleteProductUseCase => ({
  execute(remoteId: string) {
    return repository.deleteProductByRemoteId(remoteId);
  },
});

