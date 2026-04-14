import { AddProductToCartUseCase } from "./addProductToCart.useCase";
import { PosRepository } from "../data/repository/pos.repository";
import { PosAddProductToCartParams } from "../types/pos.dto.types";

export function createAddProductToCartUseCase(
  repository: PosRepository,
): AddProductToCartUseCase {
  return {
    async execute(
      params: PosAddProductToCartParams,
    ) {
      return await repository.addProductToCart(params);
    },
  };
}
