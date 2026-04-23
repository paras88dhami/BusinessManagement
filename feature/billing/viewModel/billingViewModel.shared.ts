import {
  BillingDocument,
  BillingDocumentStatus,
  BillingDocumentStatusValue,
  BillingDocumentType,
} from "@/feature/billing/types/billing.types";
import {
  BillingDocumentFormState,
  BillingLineItemFormState,
} from "./billing.viewModel";
import * as Crypto from "expo-crypto";

export type BillingDocumentEditorInternalState = BillingDocumentFormState & {
  remoteId: string | null;
  status: BillingDocumentStatusValue;
};

export type BillingDraftTotals = {
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
};

export const createEmptyLineItem = (): BillingLineItemFormState => ({
  remoteId: Crypto.randomUUID(),
  itemName: "",
  quantity: "1",
  unitRate: "0",
  fieldErrors: {},
});

export const createEmptyForm = (
  defaultTaxRatePercent: string,
): BillingDocumentEditorInternalState => ({
  remoteId: null,
  documentType: BillingDocumentType.Invoice,
  customerName: "",
  status: BillingDocumentStatus.Pending,
  taxRatePercent: defaultTaxRatePercent,
  notes: "",
  issuedAt: new Date().toISOString().slice(0, 10),
  dueAt: "",
  paidNowAmount: "0",
  settlementAccountRemoteId: "",
  items: [createEmptyLineItem()],
  fieldErrors: {},
});

export const parseNumber = (value: string): number => {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatDateInput = (timestamp: number | null): string => {
  if (timestamp === null) {
    return "";
  }

  const value = new Date(timestamp);
  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toISOString().slice(0, 10);
};

export const mapDocumentToEditorForm = (
  document: BillingDocument,
): BillingDocumentEditorInternalState => ({
  remoteId: document.remoteId,
  documentType: document.documentType,
  customerName: document.customerName,
  status: document.status,
  taxRatePercent: String(document.taxRatePercent),
  notes: document.notes ?? "",
  issuedAt: formatDateInput(document.issuedAt),
  dueAt: formatDateInput(document.dueAt),
  paidNowAmount: "0",
  settlementAccountRemoteId: "",
  items:
    document.items.length > 0
      ? document.items.map((item) => ({
          remoteId: item.remoteId,
          itemName: item.itemName,
          quantity: String(item.quantity),
          unitRate: String(item.unitRate),
          fieldErrors: {},
        }))
      : [createEmptyLineItem()],
  fieldErrors: {},
});
