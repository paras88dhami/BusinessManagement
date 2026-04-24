import { MoneyAccountModel } from "@/feature/accounts/data/dataSource/db/moneyAccount.model";
import { BillingDocumentModel } from "@/feature/billing/data/dataSource/db/billingDocument.model";
import { EmiPlanModel } from "@/feature/emiLoans/data/dataSource/db/emiPlan.model";
import { InventoryMovementModel } from "@/feature/inventory/data/dataSource/db/inventoryMovement.model";
import { LedgerEntryModel } from "@/feature/ledger/data/dataSource/db/ledger.model";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import {
  ReportBillingDocumentRecord,
  ReportEmiPlanRecord,
  ReportInventoryMovementRecord,
  ReportLedgerEntryRecord,
  ReportMoneyAccountRecord,
  ReportProductRecord,
  ReportTransactionRecord,
} from "@/feature/reports/types/report.entity.types";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";

export const mapTransactionModel = (
  model: TransactionModel,
): ReportTransactionRecord => ({
  remoteId: model.remoteId,
  title: model.title,
  amount: model.amount,
  categoryLabel: model.categoryLabel,
  happenedAt: model.happenedAt,
  direction: model.direction,
  transactionType: model.transactionType,
  accountDisplayNameSnapshot: model.accountDisplayNameSnapshot,
  settlementMoneyAccountRemoteId: model.settlementMoneyAccountRemoteId,
  settlementMoneyAccountDisplayNameSnapshot:
    model.settlementMoneyAccountDisplayNameSnapshot,
});

export const mapBillingDocumentModel = (
  model: BillingDocumentModel,
): ReportBillingDocumentRecord => ({
  remoteId: model.remoteId,
  documentType: model.documentType,
  customerName: model.customerName,
  status: model.status,
  totalAmount: model.totalAmount,
  issuedAt: model.issuedAt,
});

export const mapLedgerEntryModel = (
  model: LedgerEntryModel,
): ReportLedgerEntryRecord => ({
  remoteId: model.remoteId,
  partyName: model.partyName,
  partyPhone: model.partyPhone,
  contactRemoteId: model.contactRemoteId,
  entryType: model.entryType,
  balanceDirection: model.balanceDirection,
  amount: model.amount,
  currencyCode: model.currencyCode,
  happenedAt: model.happenedAt,
  dueAt: model.dueAt,
});

export const mapEmiPlanModel = (model: EmiPlanModel): ReportEmiPlanRecord => ({
  title: model.title,
  totalAmount: model.totalAmount,
  paidAmount: model.paidAmount,
  installmentCount: model.installmentCount,
  paidInstallmentCount: model.paidInstallmentCount,
  nextDueAt: model.nextDueAt,
  status: model.status,
});

export const mapInventoryMovementModel = (
  model: InventoryMovementModel,
): ReportInventoryMovementRecord => ({
  productRemoteId: model.productRemoteId,
  productNameSnapshot: model.productNameSnapshot,
  productUnitLabelSnapshot: model.productUnitLabelSnapshot,
  movementType: model.movementType,
  deltaQuantity: model.deltaQuantity,
  unitRate: model.unitRate,
  movementAt: model.movementAt,
});

export const mapProductModel = (model: ProductModel): ReportProductRecord => ({
  remoteId: model.remoteId,
  name: model.name,
  categoryName: model.categoryName,
  salePrice: model.salePrice,
  costPrice: model.costPrice,
  stockQuantity: model.stockQuantity,
  unitLabel: model.unitLabel,
  status: model.status,
});

export const mapMoneyAccountModel = (
  model: MoneyAccountModel,
): ReportMoneyAccountRecord => ({
  remoteId: model.remoteId,
  name: model.name,
  accountType: model.accountType,
  currentBalance: model.currentBalance,
  currencyCode: model.currencyCode,
  isPrimary: model.isPrimary,
  isActive: model.isActive,
});
