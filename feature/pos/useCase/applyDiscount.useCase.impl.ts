import { PosRepository } from "../data/repository/pos.repository";
import { PosApplyAmountAdjustmentParams } from "../types/pos.dto.types";
import { PosTotalsResult } from "../types/pos.error.types";
import { ApplyDiscountUseCase } from "./applyDiscount.useCase";

export const createApplyDiscountUseCase = (
  repository: PosRepository,
): ApplyDiscountUseCase => ({
  async execute(params: PosApplyAmountAdjustmentParams): Promise<PosTotalsResult> {
    return repository.applyDiscount(params);
  },
});
