import {
  BillPhoto,
  BillingDocument,
  BillingDocumentTypeValue,
} from "@/feature/billing/types/billing.types";

export type BillingTabValue = "invoices" | "receipts" | "billPhotos";

export type BillingLineItemFormFieldName = "itemName" | "quantity" | "unitRate";

export type BillingLineItemFormFieldErrors = Partial<
  Record<BillingLineItemFormFieldName, string>
>;

export type BillingLineItemFormState = {
  remoteId: string;
  itemName: string;
  quantity: string;
  unitRate: string;
  fieldErrors: BillingLineItemFormFieldErrors;
};

export type BillingDocumentFormFieldName =
  | "customerName"
  | "items"
  | "issuedAt"
  | "dueAt"
  | "paidNowAmount"
  | "settlementAccountRemoteId";

export type BillingDocumentFormFieldErrors = Partial<
  Record<BillingDocumentFormFieldName, string>
>;

export type BillingDocumentFormState = {
  documentType: BillingDocumentTypeValue;
  customerName: string;
  taxRatePercent: string;
  notes: string;
  issuedAt: string;
  dueAt: string;
  paidNowAmount: string;
  settlementAccountRemoteId: string;
  items: BillingLineItemFormState[];
  fieldErrors: BillingDocumentFormFieldErrors;
};

export type BillingSettlementAccountOption = {
  remoteId: string;
  label: string;
};

export interface BillingViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  activeTab: BillingTabValue;
  summary: {
    totalDocuments: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  documents: readonly BillingDocument[];
  billPhotos: readonly BillPhoto[];
  isEditorVisible: boolean;
  editorTitle: string;
  form: BillingDocumentFormState;
  currencyCode: string;
  countryCode: string | null;
  taxLabel: string;
  taxRateOptions: readonly string[];
  availableSettlementAccounts: readonly BillingSettlementAccountOption[];
  canManage: boolean;
  onRefresh: () => Promise<void>;
  onTabChange: (value: BillingTabValue) => void;
  onOpenCreate: () => void;
  onOpenEdit: (document: BillingDocument) => void;
  onCloseEditor: () => void;
  onFormChange: (
    field: keyof Omit<BillingDocumentFormState, "items" | "fieldErrors">,
    value: string,
  ) => void;
  onLineItemChange: (
    remoteId: string,
    field: keyof Omit<BillingLineItemFormState, "fieldErrors">,
    value: string,
  ) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (remoteId: string) => void;
  onSubmit: () => Promise<void>;
  onDelete: (document: BillingDocument) => Promise<void>;
  onPrintPreview: () => void;
  onUploadBillPhoto: () => Promise<void>;
  draftTotals: {
    subtotalAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
}
