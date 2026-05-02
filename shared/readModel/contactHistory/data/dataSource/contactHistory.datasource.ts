import { BillingDocumentModel } from "@/feature/billing/data/dataSource/db/billingDocument.model";
import { ContactModel } from "@/feature/contacts/data/dataSource/db/contact.model";
import { LedgerEntryModel } from "@/feature/ledger/data/dataSource/db/ledger.model";
import { OrderModel } from "@/feature/orders/data/dataSource/db/order.model";
import { PosSaleModel } from "@/feature/pos/data/dataSource/db/posSale.model";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import { ContactHistoryQuery } from "@/shared/readModel/contactHistory/types/contactHistory.query.types";
import { Result } from "@/shared/types/result.types";

export type ContactHistoryRawDataset = {
  contact: ContactModel;
  transactions: readonly TransactionModel[];
  billingDocuments: readonly BillingDocumentModel[];
  ledgerEntries: readonly LedgerEntryModel[];
  orders: readonly OrderModel[];
  posSales: readonly PosSaleModel[];
};

export interface ContactHistoryDatasource {
  getDataset(
    query: ContactHistoryQuery,
  ): Promise<Result<ContactHistoryRawDataset>>;
}

