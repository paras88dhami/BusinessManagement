import type { PosRepository } from "../data/repository/pos.repository";
import type { PosCommitSaleInventoryMutationsParams } from "../types/pos.dto.types";
import type { PosOperationResult } from "../types/pos.error.types";
import type { CommitPosSaleInventoryMutationsUseCase } from "./commitPosSaleInventoryMutations.useCase";

export const createCommitPosSaleInventoryMutationsUseCase = (
  repository: PosRepository,
): CommitPosSaleInventoryMutationsUseCase => ({
  async execute(
    params: PosCommitSaleInventoryMutationsParams,
  ): Promise<PosOperationResult> {
    return repository.commitSaleInventoryMutations(params);
  },
});
