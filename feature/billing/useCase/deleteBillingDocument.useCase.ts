import { BillingOperationResult } from "@/feature/billing/types/billing.types";

export interface DeleteBillingDocumentUseCase {
  execute(remoteId: string): Promise<BillingOperationResult>;
}
