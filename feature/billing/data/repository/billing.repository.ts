import {
  BillingDocumentResult,
  BillingOperationResult,
  BillingOverviewResult,
  SaveBillPhotoPayload,
  SaveBillingDocumentPayload,
} from "@/feature/billing/types/billing.types";

export interface BillingRepository {
  getBillingOverviewByAccountRemoteId(accountRemoteId: string): Promise<BillingOverviewResult>;
  saveBillingDocument(payload: SaveBillingDocumentPayload): Promise<BillingDocumentResult>;
  deleteBillingDocumentByRemoteId(remoteId: string): Promise<BillingOperationResult>;
  saveBillPhoto(payload: SaveBillPhotoPayload): Promise<BillingOperationResult>;
}
