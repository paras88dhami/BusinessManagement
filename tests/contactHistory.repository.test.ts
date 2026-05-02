import { BillingDocumentStatus, BillingDocumentType } from "@/feature/billing/types/billing.types";
import { LedgerBalanceDirection } from "@/feature/ledger/types/ledger.entity.types";
import { PosSaleWorkflowStatus } from "@/feature/pos/types/posSale.constant";
import {
  TransactionDirection,
  TransactionPostingStatus,
} from "@/feature/transactions/types/transaction.entity.types";
import { createContactHistoryRepository } from "@/shared/readModel/contactHistory/data/repository/contactHistory.repository.impl";
import { ContactHistoryDatasource } from "@/shared/readModel/contactHistory/data/dataSource/contactHistory.datasource";
import { describe, expect, it, vi } from "vitest";

const createDatasource = (
  datasetOrError:
    | { kind: "success"; value: Record<string, unknown> }
    | { kind: "error"; error: Error },
): ContactHistoryDatasource => ({
  getDataset: vi.fn(async () => {
    if (datasetOrError.kind === "error") {
      return {
        success: false as const,
        error: datasetOrError.error,
      };
    }

    return {
      success: true as const,
      value: datasetOrError.value as never,
    };
  }),
});

const createDataset = () => ({
  contact: {
    remoteId: "contact-1",
    fullName: "Kapil Customer",
    accountRemoteId: "business-1",
  },
  transactions: [
    {
      remoteId: "txn-voided-in",
      title: "Voided income",
      settlementMoneyAccountDisplayNameSnapshot: "Cash",
      categoryLabel: "Sales",
      sourceModule: "manual",
      happenedAt: 1_710_000_000_000,
      amount: 500,
      direction: TransactionDirection.In,
      postingStatus: TransactionPostingStatus.Voided,
    },
    {
      remoteId: "txn-posted-in",
      title: "Posted income",
      settlementMoneyAccountDisplayNameSnapshot: "Cash",
      categoryLabel: "Sales",
      sourceModule: "manual",
      happenedAt: 1_711_000_000_000,
      amount: 100,
      direction: TransactionDirection.In,
      postingStatus: TransactionPostingStatus.Posted,
    },
    {
      remoteId: "txn-posted-out",
      title: "Posted expense",
      settlementMoneyAccountDisplayNameSnapshot: "Bank",
      categoryLabel: "Expense",
      sourceModule: "manual",
      happenedAt: 1_712_000_000_000,
      amount: 40,
      direction: TransactionDirection.Out,
      postingStatus: TransactionPostingStatus.Posted,
    },
  ],
  billingDocuments: [
    {
      remoteId: "bill-open",
      documentNumber: "INV-001",
      customerName: "Kapil Customer",
      issuedAt: 1_713_000_000_000,
      totalAmount: 60,
      documentType: BillingDocumentType.Invoice,
      status: BillingDocumentStatus.Pending,
    },
    {
      remoteId: "bill-paid",
      documentNumber: "INV-002",
      customerName: "Kapil Customer",
      issuedAt: 1_714_000_000_000,
      totalAmount: 30,
      documentType: BillingDocumentType.Invoice,
      status: BillingDocumentStatus.Paid,
    },
  ],
  ledgerEntries: [
    {
      remoteId: "led-1",
      title: "Customer due",
      referenceNumber: "INV-001",
      note: null,
      happenedAt: 1_715_000_000_000,
      amount: 60,
      balanceDirection: LedgerBalanceDirection.Receive,
      entryType: "sale",
    },
    {
      remoteId: "led-2",
      title: "Settlement",
      referenceNumber: null,
      note: "Collected",
      happenedAt: 1_716_000_000_000,
      amount: 20,
      balanceDirection: LedgerBalanceDirection.Receive,
      entryType: "collection",
    },
  ],
  orders: [
    {
      remoteId: "order-1",
      orderNumber: "ORD-001",
      deliveryOrPickupDetails: "Pickup",
      notes: null,
      orderDate: 1_717_000_000_000,
      totalAmount: 120,
      status: "confirmed",
    },
  ],
  posSales: [
    {
      remoteId: "pos-failed",
      receiptNumber: "RCPT-001",
      customerNameSnapshot: "Kapil Customer",
      updatedAt: new Date(1_718_000_000_000),
      grandTotal: 80,
      workflowStatus: PosSaleWorkflowStatus.Failed,
    },
    {
      remoteId: "pos-posted",
      receiptNumber: "RCPT-002",
      customerNameSnapshot: "Kapil Customer",
      updatedAt: new Date(1_719_000_000_000),
      grandTotal: 90,
      workflowStatus: PosSaleWorkflowStatus.Posted,
    },
  ],
});

describe("contactHistory.repository", () => {
  it("maps dataset into a stable id-based contact history read model", async () => {
    const repository = createContactHistoryRepository(
      createDatasource({
        kind: "success",
        value: createDataset(),
      }),
    );

    const result = await repository.getContactHistoryReadModel({
      accountRemoteId: "business-1",
      contactRemoteId: "contact-1",
      timelineLimit: 4,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.value.accountRemoteId).toBe("business-1");
    expect(result.value.contactRemoteId).toBe("contact-1");

    expect(result.value.summary.totalMoneyIn).toBe(100);
    expect(result.value.summary.totalMoneyOut).toBe(40);
    expect(result.value.summary.openBillingDocumentCount).toBe(1);
    expect(result.value.summary.ledgerEntryCount).toBe(2);
    expect(result.value.summary.orderCount).toBe(1);
    expect(result.value.summary.posSaleCount).toBe(1);

    expect(result.value.timelineItems).toHaveLength(4);
    expect(result.value.timelineItems.map((item) => item.sourceRemoteId)).toEqual([
      "pos-posted",
      "order-1",
      "led-2",
      "led-1",
    ]);
    expect(
      result.value.timelineItems.some((item) => item.sourceRemoteId === "pos-failed"),
    ).toBe(false);
  });

  it("maps not-found datasource errors to ContactNotFound", async () => {
    const repository = createContactHistoryRepository(
      createDatasource({
        kind: "error",
        error: new Error("Contact not found."),
      }),
    );

    const result = await repository.getContactHistoryReadModel({
      accountRemoteId: "business-1",
      contactRemoteId: "contact-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("CONTACT_NOT_FOUND");
      expect(result.error.message).toContain("could not be found");
    }
  });

  it("maps unknown datasource errors safely", async () => {
    const repository = createContactHistoryRepository(
      createDatasource({
        kind: "error",
        error: new Error("Low-level read failed"),
      }),
    );

    const result = await repository.getContactHistoryReadModel({
      accountRemoteId: "business-1",
      contactRemoteId: "contact-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("UNKNOWN_ERROR");
      expect(result.error.message).toContain("Low-level read failed");
    }
  });
});

