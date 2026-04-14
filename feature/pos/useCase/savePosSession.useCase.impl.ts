import { SavePosSessionUseCase } from "./savePosSession.useCase";
import { PosRepository } from "../data/repository/pos.repository";
import { PosSaveSessionParams } from "../types/pos.dto.types";

export function createSavePosSessionUseCase(
  repository: PosRepository,
): SavePosSessionUseCase {
  return {
    async execute(
      params: PosSaveSessionParams,
    ) {
      return await repository.saveSession(params);
    },
  };
}
