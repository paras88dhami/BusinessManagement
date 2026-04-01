import { PosRepository } from "../data/repository/pos.repository";
import { PosLoadBootstrapParams } from "../types/pos.dto.types";
import { PosBootstrapResult } from "../types/pos.error.types";
import { GetPosBootstrapUseCase } from "./getPosBootstrap.useCase";

export const createGetPosBootstrapUseCase = (
  repository: PosRepository,
): GetPosBootstrapUseCase => ({
  async execute(params: PosLoadBootstrapParams): Promise<PosBootstrapResult> {
    return repository.loadBootstrap(params);
  },
});
