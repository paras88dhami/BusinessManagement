import { LoadPosSessionUseCase } from "./loadPosSession.useCase";
import { PosRepository } from "../data/repository/pos.repository";
import { PosLoadSessionParams } from "../types/pos.dto.types";

export function createLoadPosSessionUseCase(
  repository: PosRepository,
): LoadPosSessionUseCase {
  return {
    async execute(
      params: PosLoadSessionParams,
    ) {
      return await repository.loadSession(params);
    },
  };
}
