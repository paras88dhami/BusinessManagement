import { ReportQuery } from "@/feature/reports/types/report.entity.types";
import { Result } from "@/shared/types/result.types";
import { BillingDocumentModel } from "@/feature/billing/data/dataSource/db/billingDocument.model";
import { EmiPlanModel } from "@/feature/emiLoans/data/dataSource/db/emiPlan.model";
import { InventoryMovementModel } from "@/feature/inventory/data/dataSource/db/inventoryMovement.model";
import { LedgerEntryModel } from "@/feature/ledger/data/dataSource/db/ledger.model";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import { MoneyAccountModel } from "@/feature/accounts/data/dataSource/db/moneyAccount.model";

export type ReportsRawDataset = {
  transactions: TransactionModel[];
  billingDocuments: BillingDocumentModel[];
  ledgerEntries: LedgerEntryModel[];
  emiPlans: EmiPlanModel[];
  inventoryMovements: InventoryMovementModel[];
  products: ProductModel[];
  moneyAccounts: MoneyAccountModel[];
};

export interface ReportsDatasource {
  getDataset(query: ReportQuery): Promise<Result<ReportsRawDataset>>;
}
