import { BillingOperationResult, SaveBillPhotoPayload } from "@/feature/billing/types/billing.types";

export interface SaveBillPhotoUseCase {
  execute(payload: SaveBillPhotoPayload): Promise<BillingOperationResult>;
}
