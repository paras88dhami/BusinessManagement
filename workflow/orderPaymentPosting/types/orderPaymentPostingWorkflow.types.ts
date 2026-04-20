import { OrderError } from "@/feature/orders/types/order.types";
import { Result } from "@/shared/types/result.types";

export type OrderPaymentPostingWorkflowInput = {
  orderRemoteId: string;
  orderNumber: string;
  ownerUserRemoteId: string;
  accountRemoteId: string;
  accountDisplayNameSnapshot: string;
  currencyCode: string | null;
  amount: number;
  happenedAt: number;
  settlementMoneyAccountRemoteId: string;
  settlementMoneyAccountDisplayNameSnapshot: string;
  note: string | null;
  paymentAttemptRemoteId: string;
};

export type OrderPaymentPostingWorkflowValue = {
  orderRemoteId: string;
  paymentTransactionRemoteId: string;
  settlementLedgerEntryRemoteId: string;
  billingDocumentRemoteId: string;
  ledgerDueEntryRemoteId: string;
};

export type OrderPaymentPostingWorkflowResult = Result<
  OrderPaymentPostingWorkflowValue,
  OrderError
>;
