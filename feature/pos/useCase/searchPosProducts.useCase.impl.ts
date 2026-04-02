import { PosRepository } from "../data/repository/pos.repository";
import { PosProduct } from "../types/pos.entity.types";
import { SearchPosProductsUseCase } from "./searchPosProducts.useCase";

export const createSearchPosProductsUseCase = (
  repository: PosRepository,
): SearchPosProductsUseCase => ({
  async execute(searchTerm: string): Promise<readonly PosProduct[]> {
    return repository.searchProducts(searchTerm);
  },
});
