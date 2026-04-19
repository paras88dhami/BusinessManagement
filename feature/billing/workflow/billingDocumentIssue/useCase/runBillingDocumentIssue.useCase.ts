import {
  BillingDocumentResult,
  BillingDocumentStatusValue,
  BillingDocumentTypeValue,
  SaveBillingLineItemPayload,
} from "@/feature/billing/types/billing.types";

export type RunBillingDocumentIssuePayload = {
  remoteId: string;
  accountRemoteId: string;
  ownerUserRemoteId: string | null;
  documentType: BillingDocumentTypeValue;
  desiredStatus: BillingDocumentStatusValue;
  customerName: string;
  taxRatePercent: number;
  notes: string | null;
  issuedAt: number;
  dueAt: number | null;
  items: readonly SaveBillingLineItemPayload[];
};

export interface RunBillingDocumentIssueUseCase {
  execute(
    payload: RunBillingDocumentIssuePayload,
  ): Promise<BillingDocumentResult>;
}
