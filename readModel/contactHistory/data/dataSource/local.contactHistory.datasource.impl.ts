import { BillingDocumentModel } from "@/feature/billing/data/dataSource/db/billingDocument.model";
import { ContactModel } from "@/feature/contacts/data/dataSource/db/contact.model";
import { LedgerEntryModel } from "@/feature/ledger/data/dataSource/db/ledger.model";
import { OrderModel } from "@/feature/orders/data/dataSource/db/order.model";
import { PosSaleModel } from "@/feature/pos/data/dataSource/db/posSale.model";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import { ContactHistoryQuery } from "@/readModel/contactHistory/types/contactHistory.query.types";
import { Result } from "@/shared/types/result.types";
import { Database, Q } from "@nozbe/watermelondb";
import {
  ContactHistoryDatasource,
  ContactHistoryRawDataset,
} from "./contactHistory.datasource";

const CONTACTS_TABLE = "contacts";
const TRANSACTIONS_TABLE = "transactions";
const BILLING_DOCUMENTS_TABLE = "billing_documents";
const LEDGER_ENTRIES_TABLE = "ledger_entries";
const ORDERS_TABLE = "orders";
const POS_SALES_TABLE = "pos_sales";

const loadContact = async (
  database: Database,
  query: ContactHistoryQuery,
): Promise<ContactModel> => {
  const collection = database.get<ContactModel>(CONTACTS_TABLE);
  const records = await collection
    .query(
      Q.where("account_remote_id", query.accountRemoteId),
      Q.where("remote_id", query.contactRemoteId),
      Q.where("deleted_at", Q.eq(null)),
    )
    .fetch();

  const contact = records[0] ?? null;
  if (!contact) {
    throw new Error("Contact not found.");
  }

  return contact;
};

const loadTransactions = async (
  database: Database,
  query: ContactHistoryQuery,
): Promise<readonly TransactionModel[]> => {
  const collection = database.get<TransactionModel>(TRANSACTIONS_TABLE);

  return collection
    .query(
      Q.where("account_remote_id", query.accountRemoteId),
      Q.where("contact_remote_id", query.contactRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("happened_at", Q.desc),
    )
    .fetch();
};

const loadBillingDocuments = async (
  database: Database,
  query: ContactHistoryQuery,
): Promise<readonly BillingDocumentModel[]> => {
  const collection = database.get<BillingDocumentModel>(BILLING_DOCUMENTS_TABLE);

  return collection
    .query(
      Q.where("account_remote_id", query.accountRemoteId),
      Q.where("contact_remote_id", query.contactRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("issued_at", Q.desc),
    )
    .fetch();
};

const loadLedgerEntries = async (
  database: Database,
  query: ContactHistoryQuery,
): Promise<readonly LedgerEntryModel[]> => {
  const collection = database.get<LedgerEntryModel>(LEDGER_ENTRIES_TABLE);

  return collection
    .query(
      Q.where("business_account_remote_id", query.accountRemoteId),
      Q.where("contact_remote_id", query.contactRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("happened_at", Q.desc),
    )
    .fetch();
};

const loadOrders = async (
  database: Database,
  query: ContactHistoryQuery,
): Promise<readonly OrderModel[]> => {
  const collection = database.get<OrderModel>(ORDERS_TABLE);

  return collection
    .query(
      Q.where("account_remote_id", query.accountRemoteId),
      Q.where("customer_remote_id", query.contactRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("order_date", Q.desc),
    )
    .fetch();
};

const loadPosSales = async (
  database: Database,
  query: ContactHistoryQuery,
): Promise<readonly PosSaleModel[]> => {
  const collection = database.get<PosSaleModel>(POS_SALES_TABLE);

  return collection
    .query(
      Q.where("business_account_remote_id", query.accountRemoteId),
      Q.where("customer_remote_id", query.contactRemoteId),
      Q.where("deleted_at", Q.eq(null)),
      Q.sortBy("updated_at", Q.desc),
    )
    .fetch();
};

export const createLocalContactHistoryDatasource = (
  database: Database,
): ContactHistoryDatasource => ({
  async getDataset(
    query: ContactHistoryQuery,
  ): Promise<Result<ContactHistoryRawDataset>> {
    try {
      const contact = await loadContact(database, query);

      const [transactions, billingDocuments, ledgerEntries, orders, posSales] =
        await Promise.all([
          loadTransactions(database, query),
          loadBillingDocuments(database, query),
          loadLedgerEntries(database, query),
          loadOrders(database, query),
          loadPosSales(database, query),
        ]);

      return {
        success: true,
        value: {
          contact,
          transactions,
          billingDocuments,
          ledgerEntries,
          orders,
          posSales,
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
