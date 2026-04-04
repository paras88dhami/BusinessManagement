import { BillingDocumentModel } from "./billingDocument.model";
import { billingDocumentsTable } from "./billingDocument.schema";
import { BillingDocumentItemModel } from "./billingDocumentItem.model";
import { billingDocumentItemsTable } from "./billingDocumentItem.schema";
import { BillPhotoModel } from "./billPhoto.model";
import { billPhotosTable } from "./billPhoto.schema";

export const billingDbConfig = {
  models: [BillingDocumentModel, BillingDocumentItemModel, BillPhotoModel],
  tables: [billingDocumentsTable, billingDocumentItemsTable, billPhotosTable],
};
