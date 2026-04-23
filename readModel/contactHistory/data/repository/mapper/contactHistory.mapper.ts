import { BillingDocumentModel } from "@/feature/billing/data/dataSource/db/billingDocument.model";
import { BillingDocumentStatus, BillingDocumentType } from "@/feature/billing/types/billing.types";
import { LedgerEntryModel } from "@/feature/ledger/data/dataSource/db/ledger.model";
import { LedgerBalanceDirection } from "@/feature/ledger/types/ledger.entity.types";
import { OrderModel } from "@/feature/orders/data/dataSource/db/order.model";
import { PosSaleModel } from "@/feature/pos/data/dataSource/db/posSale.model";
import { PosSaleWorkflowStatus } from "@/feature/pos/types/posSale.constant";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import {
  TransactionDirection,
  TransactionPostingStatus,
} from "@/feature/transactions/types/transaction.entity.types";
import {
  ContactHistoryAmountTone,
  ContactHistoryEventType,
  ContactHistoryReadModel,
  ContactHistoryTimelineItem,
} from "@/readModel/contactHistory/types/contactHistory.readModel.types";

export const OPEN_BILLING_DOCUMENT_STATUSES = new Set<string>([
  BillingDocumentStatus.Pending,
  BillingDocumentStatus.PartiallyPaid,
  BillingDocumentStatus.Overdue,
]);

export const INCLUDED_POS_WORKFLOW_STATUSES = new Set<string>([
  PosSaleWorkflowStatus.Posted,
  PosSaleWorkflowStatus.PartiallyPosted,
]);

export const isPostedTransaction = (transaction: TransactionModel): boolean =>
  transaction.postingStatus === TransactionPostingStatus.Posted;

export const isIncludedPosSale = (sale: PosSaleModel): boolean =>
  INCLUDED_POS_WORKFLOW_STATUSES.has(sale.workflowStatus);

export const mapTransactionModelToTimelineItem = (
  model: TransactionModel,
): ContactHistoryTimelineItem => ({
  id: `transaction:${model.remoteId}`,
  sourceRemoteId: model.remoteId,
  eventType: ContactHistoryEventType.Transaction,
  title: model.title,
  subtitle:
    model.settlementMoneyAccountDisplayNameSnapshot ??
    model.categoryLabel ??
    model.sourceModule ??
    null,
  occurredAt: model.happenedAt,
  amount: model.amount,
  amountTone:
    model.direction === TransactionDirection.In
      ? ContactHistoryAmountTone.Positive
      : ContactHistoryAmountTone.Negative,
  statusLabel: model.postingStatus,
});

export const mapBillingDocumentModelToTimelineItem = (
  model: BillingDocumentModel,
): ContactHistoryTimelineItem => ({
  id: `billing:${model.remoteId}`,
  sourceRemoteId: model.remoteId,
  eventType: ContactHistoryEventType.BillingDocument,
  title: `${model.documentNumber}`,
  subtitle: model.customerName,
  occurredAt: model.issuedAt,
  amount: model.totalAmount,
  amountTone:
    model.documentType === BillingDocumentType.CreditNote
      ? ContactHistoryAmountTone.Negative
      : ContactHistoryAmountTone.Positive,
  statusLabel: model.status,
});

export const mapLedgerEntryModelToTimelineItem = (
  model: LedgerEntryModel,
): ContactHistoryTimelineItem => ({
  id: `ledger:${model.remoteId}`,
  sourceRemoteId: model.remoteId,
  eventType: ContactHistoryEventType.LedgerEntry,
  title: model.title,
  subtitle: model.referenceNumber ? `Ref ${model.referenceNumber}` : model.note,
  occurredAt: model.happenedAt,
  amount: model.amount,
  amountTone:
    model.balanceDirection === LedgerBalanceDirection.Receive
      ? ContactHistoryAmountTone.Positive
      : ContactHistoryAmountTone.Negative,
  statusLabel: model.entryType,
});

export const mapOrderModelToTimelineItem = (
  model: OrderModel,
): ContactHistoryTimelineItem => ({
  id: `order:${model.remoteId}`,
  sourceRemoteId: model.remoteId,
  eventType: ContactHistoryEventType.Order,
  title: `Order ${model.orderNumber}`,
  subtitle: model.deliveryOrPickupDetails ?? model.notes ?? null,
  occurredAt: model.orderDate,
  amount: model.totalAmount,
  amountTone:
    model.totalAmount && model.totalAmount > 0
      ? ContactHistoryAmountTone.Positive
      : ContactHistoryAmountTone.Neutral,
  statusLabel: model.status,
});

export const mapPosSaleModelToTimelineItem = (
  model: PosSaleModel,
): ContactHistoryTimelineItem => ({
  id: `pos:${model.remoteId}`,
  sourceRemoteId: model.remoteId,
  eventType: ContactHistoryEventType.PosSale,
  title: `POS Sale ${model.receiptNumber}`,
  subtitle: model.customerNameSnapshot ?? null,
  occurredAt: model.updatedAt.getTime(),
  amount: model.grandTotal,
  amountTone: ContactHistoryAmountTone.Positive,
  statusLabel: model.workflowStatus,
});

export const buildContactHistoryReadModel = (params: {
  accountRemoteId: string;
  contactRemoteId: string;
  transactions: readonly TransactionModel[];
  billingDocuments: readonly BillingDocumentModel[];
  ledgerEntries: readonly LedgerEntryModel[];
  orders: readonly OrderModel[];
  posSales: readonly PosSaleModel[];
  timelineLimit: number;
}): ContactHistoryReadModel => {
  const postedTransactions = params.transactions.filter(isPostedTransaction);
  const includedPosSales = params.posSales.filter(isIncludedPosSale);

  const timelineItems = [
    ...params.transactions.map(mapTransactionModelToTimelineItem),
    ...params.billingDocuments.map(mapBillingDocumentModelToTimelineItem),
    ...params.ledgerEntries.map(mapLedgerEntryModelToTimelineItem),
    ...params.orders.map(mapOrderModelToTimelineItem),
    ...includedPosSales.map(mapPosSaleModelToTimelineItem),
  ]
    .sort((left, right) => right.occurredAt - left.occurredAt)
    .slice(0, params.timelineLimit);

  return {
    accountRemoteId: params.accountRemoteId,
    contactRemoteId: params.contactRemoteId,
    summary: {
      totalMoneyIn: postedTransactions
        .filter((transaction) => transaction.direction === TransactionDirection.In)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      totalMoneyOut: postedTransactions
        .filter((transaction) => transaction.direction === TransactionDirection.Out)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      openBillingDocumentCount: params.billingDocuments.filter((document) =>
        OPEN_BILLING_DOCUMENT_STATUSES.has(document.status),
      ).length,
      ledgerEntryCount: params.ledgerEntries.length,
      orderCount: params.orders.length,
      posSaleCount: includedPosSales.length,
      timelineItemCount: timelineItems.length,
    },
    timelineItems,
  };
};
