import { PosRepository } from "../data/repository/pos.repository";
import { PosRemoveSlotProductParams } from "../types/pos.dto.types";
import { PosCartLinesResult } from "../types/pos.error.types";
import { RemoveProductFromSlotUseCase } from "./removeProductFromSlot.useCase";

export const createRemoveProductFromSlotUseCase = (
  repository: PosRepository,
): RemoveProductFromSlotUseCase => ({
  async execute(params: PosRemoveSlotProductParams): Promise<PosCartLinesResult> {
    return repository.removeProductFromSlot(params);
  },
});
