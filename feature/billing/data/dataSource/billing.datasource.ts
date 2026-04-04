import { Result } from "@/shared/types/result.types";
import { BillingDocumentModel } from "./db/billingDocument.model";
import { BillingDocumentItemModel } from "./db/billingDocumentItem.model";
import { BillPhotoModel } from "./db/billPhoto.model";
import {
  SaveBillPhotoPayload,
  SaveBillingDocumentPayload,
} from "@/feature/billing/types/billing.types";

export type BillingDocumentRecord = {
  document: BillingDocumentModel;
  items: BillingDocumentItemModel[];
};

export interface BillingDatasource {
  saveBillingDocument(
    payload: SaveBillingDocumentPayload,
  ): Promise<Result<BillingDocumentRecord>>;
  getBillingDocumentsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<BillingDocumentRecord[]>>;
  deleteBillingDocumentByRemoteId(remoteId: string): Promise<Result<boolean>>;
  saveBillPhoto(payload: SaveBillPhotoPayload): Promise<Result<BillPhotoModel>>;
  getBillPhotosByAccountRemoteId(accountRemoteId: string): Promise<Result<BillPhotoModel[]>>;
}
