import { BillingDocumentResult, SaveBillingDocumentPayload } from "@/feature/billing/types/billing.types";

export interface SaveBillingDocumentUseCase {
  execute(payload: SaveBillingDocumentPayload): Promise<BillingDocumentResult>;
}
