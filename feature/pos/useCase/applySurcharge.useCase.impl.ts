import { PosRepository } from "../data/repository/pos.repository";
import { PosApplyAmountAdjustmentParams } from "../types/pos.dto.types";
import { PosTotalsResult } from "../types/pos.error.types";
import { ApplySurchargeUseCase } from "./applySurcharge.useCase";

export const createApplySurchargeUseCase = (
  repository: PosRepository,
): ApplySurchargeUseCase => ({
  async execute(params: PosApplyAmountAdjustmentParams): Promise<PosTotalsResult> {
    return repository.applySurcharge(params);
  },
});
