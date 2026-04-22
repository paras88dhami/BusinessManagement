import type { ProductKindValue } from "@/feature/products/types/product.types";

export type PosProduct = {
  id: string;
  name: string;
  categoryLabel: string;
  unitLabel: string | null;
  kind: ProductKindValue;
  price: number;
  taxRate: number;
  shortCode: string;
};

export type PosCartLine = {
  lineId: string;
  productId: string;
  productName: string;
  categoryLabel: string;
  shortCode: string;
  kind: ProductKindValue;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineSubtotal: number;
};

export type PosTotals = {
  itemCount: number;
  gross: number;
  discountAmount: number;
  surchargeAmount: number;
  taxAmount: number;
  grandTotal: number;
};

export type PosLedgerEffect = {
  type:
    | "none"
    | "due_balance_pending"
    | "due_balance_created"
    | "due_balance_create_failed"
    | "posting_sync_failed";
  dueAmount: number;
  accountRemoteId: string | null;
};

export type PosReceiptPaymentPart = {
  paymentPartId: string;
  payerLabel: string | null;
  amount: number;
  settlementAccountRemoteId: string;
  settlementAccountLabel: string | null;
};

export type PosReceipt = {
  receiptNumber: string;
  issuedAt: string;
  lines: readonly PosCartLine[];
  totals: PosTotals;
  paidAmount: number;
  dueAmount: number;
  paymentParts: readonly PosReceiptPaymentPart[];
  ledgerEffect: PosLedgerEffect;
  customerName: string | null;
  customerPhone: string | null;
  contactRemoteId: string | null;
};

export type PosSplitDraftPart = {
  paymentPartId: string;
  payerLabel: string;
  amountInput: string;
  settlementAccountRemoteId: string;
};

export type PosCustomer = {
  remoteId: string;
  fullName: string;
  phone: string | null;
  address: string | null;
};

export type PosBootstrap = {
  products: readonly PosProduct[];
  activeBusinessAccountRemoteId: string | null;
  activeOwnerUserRemoteId: string | null;
  activeSettlementAccountRemoteId: string | null;
};

export type PosSaleRecord = {
  remoteId: string;
  receiptNumber: string;
  customerName: string;
  status: string;
  issuedAt: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
};
