import { BillingDocumentModel } from "@/feature/billing/data/dataSource/db/billingDocument.model";
import { EmiPlanMode } from "@/feature/emiLoans/types/emi.entity.types";
import { EmiPlanModel } from "@/feature/emiLoans/data/dataSource/db/emiPlan.model";
import { InventoryMovementModel } from "@/feature/inventory/data/dataSource/db/inventoryMovement.model";
import { LedgerEntryModel } from "@/feature/ledger/data/dataSource/db/ledger.model";
import { ProductModel } from "@/feature/products/data/dataSource/db/product.model";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import { MoneyAccountModel } from "@/feature/accounts/data/dataSource/db/moneyAccount.model";
import { ReportQuery } from "@/feature/reports/types/report.entity.types";
import { Result } from "@/shared/types/result.types";
import { Database, Q } from "@nozbe/watermelondb";
import { ReportsDatasource, ReportsRawDataset } from "./reports.datasource";

const TRANSACTIONS_TABLE = "transactions";
const BILLING_DOCUMENTS_TABLE = "billing_documents";
const LEDGER_TABLE = "ledger_entries";
const EMI_TABLE = "emi_plans";
const INVENTORY_TABLE = "inventory_movements";
const PRODUCTS_TABLE = "products";
const MONEY_ACCOUNTS_TABLE = "money_accounts";

export const createLocalReportsDatasource = (
  database: Database,
): ReportsDatasource => ({
  async getDataset(query: ReportQuery): Promise<Result<ReportsRawDataset>> {
    try {
      const [transactions, billingDocuments, ledgerEntries, emiPlans, inventoryMovements, products, moneyAccounts] =
        await Promise.all([
          loadTransactions(database, query),
          loadBillingDocuments(database, query),
          loadLedgerEntries(database, query),
          loadEmiPlans(database, query),
          loadInventoryMovements(database, query),
          loadProducts(database, query),
          loadMoneyAccounts(database, query),
        ]);

      return {
        success: true,
        value: {
          transactions,
          billingDocuments,
          ledgerEntries,
          emiPlans,
          inventoryMovements,
          products,
          moneyAccounts,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});

const loadTransactions = async (
  database: Database,
  query: ReportQuery,
): Promise<TransactionModel[]> => {
  const collection = database.get<TransactionModel>(TRANSACTIONS_TABLE);
  const clauses = [Q.where("deleted_at", Q.eq(null))];

  if (query.accountRemoteId) {
    clauses.push(Q.where("account_remote_id", query.accountRemoteId));
  } else if (query.ownerUserRemoteId) {
    clauses.push(Q.where("owner_user_remote_id", query.ownerUserRemoteId));
  }

  return collection.query(...clauses, Q.sortBy("happened_at", Q.desc)).fetch();
};

const loadBillingDocuments = async (
  database: Database,
  query: ReportQuery,
): Promise<BillingDocumentModel[]> => {
  if (!query.accountRemoteId) {
    return [];
  }

  const collection = database.get<BillingDocumentModel>(BILLING_DOCUMENTS_TABLE);
  return collection
    .query(
      Q.where("account_remote_id", query.accountRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("issued_at", Q.desc),
    )
    .fetch();
};

const loadLedgerEntries = async (
  database: Database,
  query: ReportQuery,
): Promise<LedgerEntryModel[]> => {
  if (!query.accountRemoteId) {
    return [];
  }

  const collection = database.get<LedgerEntryModel>(LEDGER_TABLE);
  return collection
    .query(
      Q.where("business_account_remote_id", query.accountRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("happened_at", Q.desc),
    )
    .fetch();
};

const loadEmiPlans = async (
  database: Database,
  query: ReportQuery,
): Promise<EmiPlanModel[]> => {
  const collection = database.get<EmiPlanModel>(EMI_TABLE);

  if (query.scope === "business") {
    if (!query.accountRemoteId) {
      return [];
    }

    return collection
      .query(
        Q.where("business_account_remote_id", query.accountRemoteId),
        Q.where("deleted_at", Q.eq(null)),
        Q.sortBy("next_due_at", Q.asc),
      )
      .fetch();
  }

  if (!query.ownerUserRemoteId) {
    return [];
  }

  return collection
    .query(
      Q.where("owner_user_remote_id", query.ownerUserRemoteId),
      Q.where("plan_mode", EmiPlanMode.Personal),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("next_due_at", Q.asc),
    )
    .fetch();
};

const loadInventoryMovements = async (
  database: Database,
  query: ReportQuery,
): Promise<InventoryMovementModel[]> => {
  if (!query.accountRemoteId) {
    return [];
  }

  const collection = database.get<InventoryMovementModel>(INVENTORY_TABLE);
  return collection
    .query(
      Q.where("account_remote_id", query.accountRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("movement_at", Q.desc),
    )
    .fetch();
};

const loadProducts = async (
  database: Database,
  query: ReportQuery,
): Promise<ProductModel[]> => {
  if (!query.accountRemoteId) {
    return [];
  }

  const collection = database.get<ProductModel>(PRODUCTS_TABLE);
  return collection
    .query(
      Q.where("account_remote_id", query.accountRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("updated_at", Q.desc),
    )
    .fetch();
};

const loadMoneyAccounts = async (
  database: Database,
  query: ReportQuery,
): Promise<MoneyAccountModel[]> => {
  if (!query.accountRemoteId) {
    return [];
  }

  const collection = database.get<MoneyAccountModel>(MONEY_ACCOUNTS_TABLE);
  return collection
    .query(
      Q.where("scope_account_remote_id", query.accountRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("updated_at", Q.desc),
    )
    .fetch();
};
