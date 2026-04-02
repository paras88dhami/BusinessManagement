import { PosRepository } from "../data/repository/pos.repository";
import { PosChangeQuantityParams } from "../types/pos.dto.types";
import { PosCartLinesResult } from "../types/pos.error.types";
import { ChangeCartLineQuantityUseCase } from "./changeCartLineQuantity.useCase";

export const createChangeCartLineQuantityUseCase = (
  repository: PosRepository,
): ChangeCartLineQuantityUseCase => ({
  async execute(params: PosChangeQuantityParams): Promise<PosCartLinesResult> {
    return repository.changeCartLineQuantity(params);
  },
});
