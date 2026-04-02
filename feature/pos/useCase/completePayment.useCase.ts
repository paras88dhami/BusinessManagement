import { PosCompletePaymentParams } from "../types/pos.dto.types";
import { PosPaymentResult } from "../types/pos.error.types";

export interface CompletePaymentUseCase {
  execute(params: PosCompletePaymentParams): Promise<PosPaymentResult>;
}
