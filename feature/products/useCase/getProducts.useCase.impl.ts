import { ProductRepository } from "@/feature/products/data/repository/product.repository";
import { GetProductsUseCase } from "./getProducts.useCase";

export const createGetProductsUseCase = (
  repository: ProductRepository,
): GetProductsUseCase => ({
  execute(accountRemoteId: string) {
    return repository.getProductsByAccountRemoteId(accountRemoteId);
  },
});

