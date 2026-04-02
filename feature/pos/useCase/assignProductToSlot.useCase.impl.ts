import { PosRepository } from "../data/repository/pos.repository";
import { PosAssignProductToSlotParams } from "../types/pos.dto.types";
import { PosCartLinesResult } from "../types/pos.error.types";
import { AssignProductToSlotUseCase } from "./assignProductToSlot.useCase";

export const createAssignProductToSlotUseCase = (
  repository: PosRepository,
): AssignProductToSlotUseCase => ({
  async execute(params: PosAssignProductToSlotParams): Promise<PosCartLinesResult> {
    return repository.assignProductToSlot(params);
  },
});
