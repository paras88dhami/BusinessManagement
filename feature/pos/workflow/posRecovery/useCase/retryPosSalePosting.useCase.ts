import type { PosSaleRecord } from "@/feature/pos/types/posSale.entity.types";
import type { PosError } from "@/feature/pos/types/pos.error.types";
import type { RunPosCheckoutValue } from "@/feature/pos/workflow/posCheckout/types/posCheckout.types";
import type { Result } from "@/shared/types/result.types";

export interface RetryPosSalePostingUseCase {
  execute(params: {
    sale: PosSaleRecord;
  }): Promise<Result<RunPosCheckoutValue, PosError>>;
}
