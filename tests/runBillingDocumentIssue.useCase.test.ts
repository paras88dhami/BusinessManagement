import { describe, expect, it, vi } from "vitest";
import {
  BillingDocument,
  BillingDocumentStatus,
  BillingDocumentType,
  BillingErrorType,
  BillingTemplateType,
  SaveBillingDocumentPayload,
} from "@/feature/billing/types/billing.types";
import { GetBillingDocumentByRemoteIdUseCase } from "@/feature/billing/useCase/getBillingDocumentByRemoteId.useCase";
import { LinkBillingDocumentLedgerEntryUseCase } from "@/feature/billing/useCase/linkBillingDocumentLedgerEntry.useCase";
import { SaveBillingDocumentUseCase } from "@/feature/billing/useCase/saveBillingDocument.useCase";
import { DeleteBillingDocumentUseCase } from "@/feature/billing/useCase/deleteBillingDocument.useCase";
import { ContactType } from "@/feature/contacts/types/contact.types";
import { GetOrCreateBusinessContactUseCase } from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase";
import {
  LedgerBalanceDirection,
  LedgerEntry,
  LedgerEntryType,
  SaveLedgerEntryPayload,
} from "@/feature/ledger/types/ledger.entity.types";
import { AddLedgerEntryUseCase } from "@/feature/ledger/useCase/addLedgerEntry.useCase";
import { DeleteLedgerEntryUseCase } from "@/feature/ledger/useCase/deleteLedgerEntry.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { UpdateLedgerEntryUseCase } from "@/feature/ledger/useCase/updateLedgerEntry.useCase";
import {
  RunBillingDocumentIssuePayload,
} from "@/feature/billing/workflow/billingDocumentIssue/useCase/runBillingDocumentIssue.useCase";
import { createRunBillingDocumentIssueUseCase } from "@/feature/billing/workflow/billingDocumentIssue/useCase/runBillingDocumentIssue.useCase.impl";

const buildBillingDocument = (
  overrides: Partial<BillingDocument> = {},
): BillingDocument => ({
  remoteId: "bill-1",
  accountRemoteId: "business-1",
  documentNumber: "INV-2026-001",
  documentType: BillingDocumentType.Invoice,
  templateType: BillingTemplateType.StandardInvoice,
  customerName: "Acme Traders",
  contactRemoteId: "contact-1",
  status: BillingDocumentStatus.Pending,
  taxRatePercent: 13,
  notes: "note",
  subtotalAmount: 100,
  taxAmount: 13,
  totalAmount: 113,
  paidAmount: 0,
  outstandingAmount: 113,
  isOverdue: false,
  issuedAt: 1_710_000_000_000,
  dueAt: 1_710_086_400_000,
  sourceModule: null,
  sourceRemoteId: null,
  linkedLedgerEntryRemoteId: "due-1",
  items: [],
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

const buildLedgerEntry = (overrides: Partial<LedgerEntry> = {}): LedgerEntry => ({
  remoteId: "due-1",
  businessAccountRemoteId: "business-1",
  ownerUserRemoteId: "user-1",
  partyName: "Acme Traders",
  partyPhone: null,
  contactRemoteId: "contact-1",
  entryType: LedgerEntryType.Sale,
  balanceDirection: LedgerBalanceDirection.Receive,
  title: "Invoice INV-2026-001",
  amount: 113,
  currencyCode: null,
  note: "note",
  happenedAt: 1_710_000_000_000,
  dueAt: 1_710_086_400_000,
  paymentMode: null,
  referenceNumber: "INV-2026-001",
  reminderAt: null,
  attachmentUri: null,
  settledAgainstEntryRemoteId: null,
  linkedDocumentRemoteId: "bill-1",
  linkedTransactionRemoteId: null,
  settlementAccountRemoteId: null,
  settlementAccountDisplayNameSnapshot: null,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

const buildIssuePayload = (
  overrides: Partial<RunBillingDocumentIssuePayload> = {},
): RunBillingDocumentIssuePayload => ({
  remoteId: "bill-1",
  accountRemoteId: "business-1",
  ownerUserRemoteId: "user-1",
  documentType: BillingDocumentType.Invoice,
  desiredStatus: BillingDocumentStatus.Pending,
  customerName: "Acme Traders",
  taxRatePercent: 13,
  notes: "note",
  issuedAt: 1_710_000_000_000,
  dueAt: 1_710_086_400_000,
  items: [
    {
      remoteId: "line-1",
      itemName: "Service A",
      quantity: 1,
      unitRate: 100,
      lineOrder: 0,
    },
  ],
  ...overrides,
});

const createDependencies = () => {
  const getBillingDocumentByRemoteIdUseCase: { execute: any } = {
    execute: vi.fn(async () => ({
      success: false as const,
      error: {
        type: BillingErrorType.DocumentNotFound,
        message: "The requested billing document was not found.",
      },
    })),
  };

  const saveBillingDocumentUseCase: { execute: any } = {
    execute: vi.fn(async (payload: SaveBillingDocumentPayload) => ({
      success: true as const,
      value: buildBillingDocument({
        remoteId: payload.remoteId,
        accountRemoteId: payload.accountRemoteId,
        documentNumber: payload.documentNumber,
        documentType: payload.documentType,
        templateType: payload.templateType,
        customerName: payload.customerName,
        contactRemoteId: payload.contactRemoteId ?? null,
        status: payload.status,
        taxRatePercent: payload.taxRatePercent,
        notes: payload.notes,
        issuedAt: payload.issuedAt,
        dueAt: payload.dueAt ?? null,
        linkedLedgerEntryRemoteId: payload.linkedLedgerEntryRemoteId ?? null,
      }),
    })),
  };

  const deleteBillingDocumentUseCase: { execute: any } = {
    execute: vi.fn(async () => ({
      success: true as const,
      value: true,
    })),
  };

  const getOrCreateBusinessContactUseCase: { execute: any } = {
    execute: vi.fn(async () => ({
      success: true as const,
      value: {
        remoteId: "contact-1",
      },
    })),
  };

  const getLedgerEntriesUseCase: { execute: any } = {
    execute: vi.fn(async () => ({
      success: true as const,
      value: [],
    })),
  };

  const addLedgerEntryUseCase: { execute: any } = {
    execute: vi.fn(async (payload: SaveLedgerEntryPayload) => ({
      success: true as const,
      value: buildLedgerEntry({
        remoteId: payload.remoteId,
        businessAccountRemoteId: payload.businessAccountRemoteId,
        ownerUserRemoteId: payload.ownerUserRemoteId,
        partyName: payload.partyName,
        partyPhone: payload.partyPhone,
        contactRemoteId: payload.contactRemoteId ?? null,
        entryType: payload.entryType,
        balanceDirection: payload.balanceDirection,
        title: payload.title,
        amount: payload.amount,
        currencyCode: payload.currencyCode,
        note: payload.note,
        happenedAt: payload.happenedAt,
        dueAt: payload.dueAt,
        paymentMode: payload.paymentMode,
        referenceNumber: payload.referenceNumber,
        reminderAt: payload.reminderAt,
        attachmentUri: payload.attachmentUri,
        settledAgainstEntryRemoteId: payload.settledAgainstEntryRemoteId,
        linkedDocumentRemoteId: payload.linkedDocumentRemoteId ?? null,
        linkedTransactionRemoteId: payload.linkedTransactionRemoteId,
        settlementAccountRemoteId: payload.settlementAccountRemoteId,
        settlementAccountDisplayNameSnapshot:
          payload.settlementAccountDisplayNameSnapshot,
      }),
    })),
  };

  const updateLedgerEntryUseCase: { execute: any } = {
    execute: vi.fn(async (payload: SaveLedgerEntryPayload) => ({
      success: true as const,
      value: buildLedgerEntry({
        remoteId: payload.remoteId,
        businessAccountRemoteId: payload.businessAccountRemoteId,
        ownerUserRemoteId: payload.ownerUserRemoteId,
        partyName: payload.partyName,
        partyPhone: payload.partyPhone,
        contactRemoteId: payload.contactRemoteId ?? null,
        entryType: payload.entryType,
        balanceDirection: payload.balanceDirection,
        title: payload.title,
        amount: payload.amount,
        currencyCode: payload.currencyCode,
        note: payload.note,
        happenedAt: payload.happenedAt,
        dueAt: payload.dueAt,
        paymentMode: payload.paymentMode,
        referenceNumber: payload.referenceNumber,
        reminderAt: payload.reminderAt,
        attachmentUri: payload.attachmentUri,
        settledAgainstEntryRemoteId: payload.settledAgainstEntryRemoteId,
        linkedDocumentRemoteId: payload.linkedDocumentRemoteId ?? null,
        linkedTransactionRemoteId: payload.linkedTransactionRemoteId,
        settlementAccountRemoteId: payload.settlementAccountRemoteId,
        settlementAccountDisplayNameSnapshot:
          payload.settlementAccountDisplayNameSnapshot,
      }),
    })),
  };

  const deleteLedgerEntryUseCase: { execute: any } = {
    execute: vi.fn(async () => ({
      success: true as const,
      value: true,
    })),
  };

  const linkBillingDocumentLedgerEntryUseCase: { execute: any } = {
    execute: vi.fn(async () => ({
      success: true as const,
      value: true,
    })),
  };

  const useCase = createRunBillingDocumentIssueUseCase({
    getBillingDocumentByRemoteIdUseCase:
      getBillingDocumentByRemoteIdUseCase as unknown as GetBillingDocumentByRemoteIdUseCase,
    saveBillingDocumentUseCase:
      saveBillingDocumentUseCase as unknown as SaveBillingDocumentUseCase,
    deleteBillingDocumentUseCase:
      deleteBillingDocumentUseCase as unknown as DeleteBillingDocumentUseCase,
    getOrCreateBusinessContactUseCase:
      getOrCreateBusinessContactUseCase as unknown as GetOrCreateBusinessContactUseCase,
    getLedgerEntriesUseCase:
      getLedgerEntriesUseCase as unknown as GetLedgerEntriesUseCase,
    addLedgerEntryUseCase: addLedgerEntryUseCase as unknown as AddLedgerEntryUseCase,
    deleteLedgerEntryUseCase:
      deleteLedgerEntryUseCase as unknown as DeleteLedgerEntryUseCase,
    updateLedgerEntryUseCase:
      updateLedgerEntryUseCase as unknown as UpdateLedgerEntryUseCase,
    linkBillingDocumentLedgerEntryUseCase:
      linkBillingDocumentLedgerEntryUseCase as unknown as LinkBillingDocumentLedgerEntryUseCase,
  });

  return {
    useCase,
    getBillingDocumentByRemoteIdUseCase,
    saveBillingDocumentUseCase,
    deleteBillingDocumentUseCase,
    getOrCreateBusinessContactUseCase,
    getLedgerEntriesUseCase,
    addLedgerEntryUseCase,
    deleteLedgerEntryUseCase,
    updateLedgerEntryUseCase,
    linkBillingDocumentLedgerEntryUseCase,
  };
};

describe("runBillingDocumentIssue.useCase", () => {
  it("saves draft invoice without creating or updating ledger due", async () => {
    const deps = createDependencies();

    const result = await deps.useCase.execute(
      buildIssuePayload({ desiredStatus: BillingDocumentStatus.Draft }),
    );

    expect(result.success).toBe(true);
    expect(deps.saveBillingDocumentUseCase.execute).toHaveBeenCalledTimes(1);
    expect(deps.saveBillingDocumentUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        status: BillingDocumentStatus.Draft,
      }),
    );
    expect(deps.getLedgerEntriesUseCase.execute).not.toHaveBeenCalled();
    expect(deps.addLedgerEntryUseCase.execute).not.toHaveBeenCalled();
    expect(deps.updateLedgerEntryUseCase.execute).not.toHaveBeenCalled();
    expect(deps.linkBillingDocumentLedgerEntryUseCase.execute).not.toHaveBeenCalled();
  });

  it("creates and links due entry for pending invoice", async () => {
    const deps = createDependencies();

    const result = await deps.useCase.execute(buildIssuePayload());

    expect(result.success).toBe(true);
    expect(deps.getOrCreateBusinessContactUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        contactType: ContactType.Customer,
      }),
    );
    expect(deps.getLedgerEntriesUseCase.execute).toHaveBeenCalledWith({
      businessAccountRemoteId: "business-1",
    });
    expect(deps.addLedgerEntryUseCase.execute).toHaveBeenCalledTimes(1);
    expect(deps.updateLedgerEntryUseCase.execute).not.toHaveBeenCalled();

    const duePayload = deps.addLedgerEntryUseCase.execute.mock.calls[0]![0];
    expect(duePayload).toMatchObject({
      businessAccountRemoteId: "business-1",
      ownerUserRemoteId: "user-1",
      entryType: LedgerEntryType.Sale,
      balanceDirection: LedgerBalanceDirection.Receive,
      partyName: "Acme Traders",
      contactRemoteId: "contact-1",
      linkedDocumentRemoteId: "bill-1",
      referenceNumber: expect.any(String),
      amount: 113,
      happenedAt: 1_710_000_000_000,
      dueAt: 1_710_086_400_000,
    });

    expect(deps.linkBillingDocumentLedgerEntryUseCase.execute).toHaveBeenCalledTimes(1);
    expect(deps.linkBillingDocumentLedgerEntryUseCase.execute).toHaveBeenCalledWith(
      "bill-1",
      duePayload.remoteId,
    );
  });

  it("updates existing linked due entry on pending invoice edit without creating duplicate", async () => {
    const deps = createDependencies();
    deps.getBillingDocumentByRemoteIdUseCase.execute = vi.fn(async () => ({
      success: true as const,
      value: buildBillingDocument({
        documentNumber: "INV-2025-0001",
        linkedLedgerEntryRemoteId: "due-1",
      }),
    }));
    deps.getLedgerEntriesUseCase.execute = vi.fn(async () => ({
      success: true as const,
      value: [
        buildLedgerEntry({
          remoteId: "due-1",
          linkedDocumentRemoteId: "bill-1",
          entryType: LedgerEntryType.Sale,
        }),
      ],
    }));

    const result = await deps.useCase.execute(
      buildIssuePayload({
        desiredStatus: BillingDocumentStatus.Pending,
      }),
    );

    expect(result.success).toBe(true);
    expect(deps.saveBillingDocumentUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        documentNumber: "INV-2025-0001",
      }),
    );
    expect(deps.addLedgerEntryUseCase.execute).not.toHaveBeenCalled();
    expect(deps.updateLedgerEntryUseCase.execute).toHaveBeenCalledTimes(1);

    const updatePayload = deps.updateLedgerEntryUseCase.execute.mock.calls[0]![0];
    expect(updatePayload.remoteId).toBe("due-1");
    expect(updatePayload.linkedDocumentRemoteId).toBe("bill-1");
  });

  it("creates purchase due entry for pending receipt", async () => {
    const deps = createDependencies();

    const result = await deps.useCase.execute(
      buildIssuePayload({
        documentType: BillingDocumentType.Receipt,
        desiredStatus: BillingDocumentStatus.Pending,
      }),
    );

    expect(result.success).toBe(true);
    expect(deps.getOrCreateBusinessContactUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        contactType: ContactType.Supplier,
      }),
    );

    const duePayload = deps.addLedgerEntryUseCase.execute.mock.calls[0]![0];
    expect(duePayload.entryType).toBe(LedgerEntryType.Purchase);
    expect(duePayload.balanceDirection).toBe(LedgerBalanceDirection.Pay);
  });

  it("rolls back newly created non-draft billing document when ledger due creation fails", async () => {
    const deps = createDependencies();
    deps.addLedgerEntryUseCase.execute = vi.fn(async () => ({
      success: false as const,
      error: {
        type: "VALIDATION_ERROR" as const,
        message: "Amount must be greater than zero.",
      },
    }));

    const result = await deps.useCase.execute(buildIssuePayload());

    expect(result.success).toBe(false);
    expect(deps.deleteBillingDocumentUseCase.execute).toHaveBeenCalledWith(
      "bill-1",
    );
  });

  it("rejects reducing edited document total below already paid amount", async () => {
    const deps = createDependencies();
    deps.getBillingDocumentByRemoteIdUseCase.execute = vi.fn(async () => ({
      success: true as const,
      value: buildBillingDocument({
        paidAmount: 200,
        totalAmount: 220,
        outstandingAmount: 20,
      }),
    }));

    const result = await deps.useCase.execute(
      buildIssuePayload({
        taxRatePercent: 0,
        items: [
          {
            remoteId: "line-1",
            itemName: "Service A",
            quantity: 1,
            unitRate: 100,
            lineOrder: 0,
          },
        ],
      }),
    );

    expect(result.success).toBe(false);
    expect(deps.saveBillingDocumentUseCase.execute).not.toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.message).toContain("already paid");
    }
  });

  it("treats link failure as success when reread confirms linkage persisted", async () => {
    const deps = createDependencies();
    deps.getBillingDocumentByRemoteIdUseCase.execute = vi
      .fn()
      .mockResolvedValueOnce({
        success: false as const,
        error: {
          type: BillingErrorType.DocumentNotFound,
          message: "The requested billing document was not found.",
        },
      })
      .mockResolvedValueOnce({
        success: true as const,
        value: buildBillingDocument({
          linkedLedgerEntryRemoteId: "due-created-1",
        }),
      });
    deps.addLedgerEntryUseCase.execute = vi.fn(async (payload: SaveLedgerEntryPayload) => ({
      success: true as const,
      value: buildLedgerEntry({
        ...payload,
        remoteId: "due-created-1",
      }),
    }));
    deps.linkBillingDocumentLedgerEntryUseCase.execute = vi.fn(async () => ({
      success: false as const,
      error: {
        type: "VALIDATION_ERROR" as const,
        message: "link write failed",
      },
    }));

    const result = await deps.useCase.execute(buildIssuePayload());

    expect(result.success).toBe(true);
    expect(deps.deleteLedgerEntryUseCase.execute).not.toHaveBeenCalled();
    expect(deps.deleteBillingDocumentUseCase.execute).not.toHaveBeenCalled();
  });

  it("rolls back newly created due and billing document when link fails and reread does not confirm linkage", async () => {
    const deps = createDependencies();
    deps.getBillingDocumentByRemoteIdUseCase.execute = vi
      .fn()
      .mockResolvedValueOnce({
        success: false as const,
        error: {
          type: BillingErrorType.DocumentNotFound,
          message: "The requested billing document was not found.",
        },
      })
      .mockResolvedValueOnce({
        success: true as const,
        value: buildBillingDocument({
          linkedLedgerEntryRemoteId: null,
        }),
      });
    deps.addLedgerEntryUseCase.execute = vi.fn(async (payload: SaveLedgerEntryPayload) => ({
      success: true as const,
      value: buildLedgerEntry({
        ...payload,
        remoteId: "due-created-2",
      }),
    }));
    deps.linkBillingDocumentLedgerEntryUseCase.execute = vi.fn(async () => ({
      success: false as const,
      error: {
        type: "VALIDATION_ERROR" as const,
        message: "link write failed",
      },
    }));

    const result = await deps.useCase.execute(buildIssuePayload());

    expect(result.success).toBe(false);
    expect(deps.deleteLedgerEntryUseCase.execute).toHaveBeenCalledWith(
      "due-created-2",
    );
    expect(deps.deleteBillingDocumentUseCase.execute).toHaveBeenCalledWith(
      "bill-1",
    );
    if (!result.success) {
      expect(result.error.message).toContain("rollback deleted");
    }
  });

  it("returns precise failure when due rollback delete fails after link failure", async () => {
    const deps = createDependencies();
    deps.getBillingDocumentByRemoteIdUseCase.execute = vi
      .fn()
      .mockResolvedValueOnce({
        success: false as const,
        error: {
          type: BillingErrorType.DocumentNotFound,
          message: "The requested billing document was not found.",
        },
      })
      .mockResolvedValueOnce({
        success: true as const,
        value: buildBillingDocument({
          linkedLedgerEntryRemoteId: null,
        }),
      });
    deps.addLedgerEntryUseCase.execute = vi.fn(async (payload: SaveLedgerEntryPayload) => ({
      success: true as const,
      value: buildLedgerEntry({
        ...payload,
        remoteId: "due-created-3",
      }),
    }));
    deps.linkBillingDocumentLedgerEntryUseCase.execute = vi.fn(async () => ({
      success: false as const,
      error: {
        type: "VALIDATION_ERROR" as const,
        message: "link write failed",
      },
    }));
    deps.deleteLedgerEntryUseCase.execute = vi.fn(async () => ({
      success: false as const,
      error: {
        type: "VALIDATION_ERROR" as const,
        message: "due delete failed",
      },
    }));

    const result = await deps.useCase.execute(buildIssuePayload());

    expect(result.success).toBe(false);
    expect(deps.deleteLedgerEntryUseCase.execute).toHaveBeenCalledWith(
      "due-created-3",
    );
    expect(deps.deleteBillingDocumentUseCase.execute).not.toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.message).toContain("could not delete newly created due entry");
      expect(result.error.message).toContain("due delete failed");
    }
  });
});
