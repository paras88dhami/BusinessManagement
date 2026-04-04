import { BillingDocumentModel } from "@/feature/billing/data/dataSource/db/billingDocument.model";
import { BillingDocumentItemModel } from "@/feature/billing/data/dataSource/db/billingDocumentItem.model";
import { BillPhotoModel } from "@/feature/billing/data/dataSource/db/billPhoto.model";
import { BillPhoto, BillingDocument, BillingLineItem } from "@/feature/billing/types/billing.types";

export const mapBillingItemModelToDomain = (
  model: BillingDocumentItemModel,
): BillingLineItem => ({
  remoteId: model.remoteId,
  itemName: model.itemName,
  quantity: model.quantity,
  unitRate: model.unitRate,
  lineTotal: model.lineTotal,
  lineOrder: model.lineOrder,
});

export const mapBillingDocumentModelToDomain = (
  document: BillingDocumentModel,
  items: BillingDocumentItemModel[],
): BillingDocument => ({
  remoteId: document.remoteId,
  accountRemoteId: document.accountRemoteId,
  documentNumber: document.documentNumber,
  documentType: document.documentType,
  templateType: document.templateType,
  customerName: document.customerName,
  status: document.status,
  taxRatePercent: document.taxRatePercent,
  notes: document.notes,
  subtotalAmount: document.subtotalAmount,
  taxAmount: document.taxAmount,
  totalAmount: document.totalAmount,
  issuedAt: document.issuedAt,
  items: items.map(mapBillingItemModelToDomain),
  createdAt: document.createdAt.getTime(),
  updatedAt: document.updatedAt.getTime(),
});

export const mapBillPhotoModelToDomain = (model: BillPhotoModel): BillPhoto => ({
  remoteId: model.remoteId,
  accountRemoteId: model.accountRemoteId,
  documentRemoteId: model.documentRemoteId,
  fileName: model.fileName,
  mimeType: model.mimeType,
  imageDataUrl: model.imageDataUrl,
  uploadedAt: model.uploadedAt,
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});
