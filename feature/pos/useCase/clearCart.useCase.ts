import { PosOperationResult } from "../types/pos.error.types";

export interface ClearCartUseCase {
  execute(): Promise<PosOperationResult>;
}
