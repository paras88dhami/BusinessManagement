import { ClearPosSessionUseCase } from "./clearPosSession.useCase";
import { PosRepository } from "../data/repository/pos.repository";
import { PosClearSessionParams } from "../types/pos.dto.types";

export function createClearPosSessionUseCase(
  repository: PosRepository,
): ClearPosSessionUseCase {
  return {
    async execute(
      params: PosClearSessionParams,
    ) {
      return await repository.clearSession(params);
    },
  };
}
