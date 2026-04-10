import { BillingOperationResult } from "@/feature/billing/types/billing.types";

export type LinkBillingDocumentContactPayload = {
  billingDocumentRemoteId: string;
  contactRemoteId: string | null;
};

export interface LinkBillingDocumentContactUseCase {
  execute(
    payload: LinkBillingDocumentContactPayload,
  ): Promise<BillingOperationResult>;
}
