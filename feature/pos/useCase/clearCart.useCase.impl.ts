import { PosRepository } from "../data/repository/pos.repository";
import { PosOperationResult } from "../types/pos.error.types";
import { ClearCartUseCase } from "./clearCart.useCase";

export const createClearCartUseCase = (
  repository: PosRepository,
): ClearCartUseCase => ({
  async execute(): Promise<PosOperationResult> {
    return repository.clearCart();
  },
});
