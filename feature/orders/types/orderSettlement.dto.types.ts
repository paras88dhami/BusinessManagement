export type OrderSettlementSnapshot = {
  orderRemoteId: string;
  paidAmount: number;
  refundedAmount: number;
  balanceDueAmount: number;
  billingDocumentRemoteId: string | null;
  dueEntryRemoteId: string | null;
};
