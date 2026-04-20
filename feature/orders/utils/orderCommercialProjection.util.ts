import { BillingDocument } from "@/feature/billing/types/billing.types";
import { Order } from "@/feature/orders/types/order.types";
import { buildOrderBillingDocumentRemoteId } from "@/feature/orders/utils/orderCommercialEffects.util";
import {
  getOrderNetPaidAmountFromTransactions,
  resolvePersistedOrderTotalAmount,
} from "@/feature/orders/utils/orderSettlementFromTransactions.util";
import {
  Transaction,
  TransactionSourceModule,
} from "@/feature/transactions/types/transaction.entity.types";

export type OrderCommercialSettlementSnapshot = {
  billingDocument: BillingDocument | null;
  paidAmount: number;
  balanceDueAmount: number;
};

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const safeTrim = (value: string | null | undefined): string =>
  typeof value === "string" ? value.trim() : "";

export const findBillingDocumentForOrder = (params: {
  orderRemoteId: string;
  billingDocuments: readonly BillingDocument[];
}): BillingDocument | null => {
  const normalizedOrderRemoteId = safeTrim(params.orderRemoteId);
  if (!normalizedOrderRemoteId) {
    return null;
  }

  const deterministicBillingDocumentRemoteId =
    buildOrderBillingDocumentRemoteId(normalizedOrderRemoteId);

  return (
    params.billingDocuments.find(
      (document) =>
        document.remoteId === deterministicBillingDocumentRemoteId ||
        (document.sourceModule === TransactionSourceModule.Orders &&
          safeTrim(document.sourceRemoteId) === normalizedOrderRemoteId),
    ) ?? null
  );
};

export const calculateOrderCommercialSettlementSnapshot = (params: {
  order: Order;
  billingDocuments: readonly BillingDocument[];
  transactions: readonly Transaction[];
}): OrderCommercialSettlementSnapshot => {
  const billingDocument = findBillingDocumentForOrder({
    orderRemoteId: params.order.remoteId,
    billingDocuments: params.billingDocuments,
  });

  if (billingDocument) {
    return {
      billingDocument,
      paidAmount: roundMoney(billingDocument.paidAmount),
      balanceDueAmount: roundMoney(
        Math.max(billingDocument.outstandingAmount, 0),
      ),
    };
  }

  const orderTotalAmount = resolvePersistedOrderTotalAmount(params.order) ?? 0;
  const paidAmount = getOrderNetPaidAmountFromTransactions({
    orderRemoteId: params.order.remoteId,
    orderNumber: params.order.orderNumber,
    transactions: params.transactions,
  });

  return {
    billingDocument: null,
    paidAmount,
    balanceDueAmount: roundMoney(Math.max(orderTotalAmount - paidAmount, 0)),
  };
};
