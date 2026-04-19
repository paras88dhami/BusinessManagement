import {
  BillingDocument,
  BillingDocumentStatus,
  BillingDocumentStatusValue,
  BillingDocumentType,
  BillingErrorType,
  BillingTemplateType,
  BillingValidationError,
} from "@/feature/billing/types/billing.types";
import { DeleteBillingDocumentUseCase } from "@/feature/billing/useCase/deleteBillingDocument.useCase";
import { GetBillingDocumentByRemoteIdUseCase } from "@/feature/billing/useCase/getBillingDocumentByRemoteId.useCase";
import { LinkBillingDocumentLedgerEntryUseCase } from "@/feature/billing/useCase/linkBillingDocumentLedgerEntry.useCase";
import { SaveBillingDocumentUseCase } from "@/feature/billing/useCase/saveBillingDocument.useCase";
import { ContactType } from "@/feature/contacts/types/contact.types";
import { GetOrCreateBusinessContactUseCase } from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase";
import {
  LedgerBalanceDirection,
  LedgerBalanceDirectionValue,
  LedgerEntry,
  LedgerEntryType,
  LedgerEntryTypeValue,
  SaveLedgerEntryPayload,
} from "@/feature/ledger/types/ledger.entity.types";
import { AddLedgerEntryUseCase } from "@/feature/ledger/useCase/addLedgerEntry.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { UpdateLedgerEntryUseCase } from "@/feature/ledger/useCase/updateLedgerEntry.useCase";
import {
  RunBillingDocumentIssuePayload,
  RunBillingDocumentIssueUseCase,
} from "./runBillingDocumentIssue.useCase";

type CreateRunBillingDocumentIssueUseCaseParams = {
  getBillingDocumentByRemoteIdUseCase: GetBillingDocumentByRemoteIdUseCase;
  saveBillingDocumentUseCase: SaveBillingDocumentUseCase;
  deleteBillingDocumentUseCase: DeleteBillingDocumentUseCase;
  getOrCreateBusinessContactUseCase: GetOrCreateBusinessContactUseCase;
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase;
  addLedgerEntryUseCase: AddLedgerEntryUseCase;
  updateLedgerEntryUseCase: UpdateLedgerEntryUseCase;
  linkBillingDocumentLedgerEntryUseCase: LinkBillingDocumentLedgerEntryUseCase;
};

const normalizeRequired = (value: string): string => value.trim();

const normalizeOptional = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const createLedgerEntryRemoteId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `led-billing-due-${randomId}`;
  }

  return `led-billing-due-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const buildDocumentNumber = ({
  documentType,
  remoteId,
  issuedAt,
}: {
  documentType: BillingDocument["documentType"];
  remoteId: string;
  issuedAt: number;
}): string => {
  const prefix = documentType === BillingDocumentType.Receipt ? "RCPT" : "INV";
  const year = new Date(issuedAt).getUTCFullYear();
  const token = remoteId.replace(/-/g, "").slice(-8).toUpperCase();

  return `${prefix}-${year}-${token}`;
};

const resolveTemplateTypeForDocumentType = (
  documentType: BillingDocument["documentType"],
): BillingDocument["templateType"] => {
  if (documentType === BillingDocumentType.Receipt) {
    return BillingTemplateType.PosReceipt;
  }

  return BillingTemplateType.StandardInvoice;
};

const resolveContactTypeForDocumentType = (
  documentType: BillingDocument["documentType"],
): (typeof ContactType)[keyof typeof ContactType] => {
  if (documentType === BillingDocumentType.Invoice) {
    return ContactType.Customer;
  }

  return ContactType.Supplier;
};

const resolveIssuedStatus = (
  desiredStatus: BillingDocumentStatusValue,
): BillingDocumentStatusValue => {
  if (desiredStatus === BillingDocumentStatus.Draft) {
    return BillingDocumentStatus.Draft;
  }

  return BillingDocumentStatus.Pending;
};

const resolveLedgerDueEntryTypeForDocumentType = (
  documentType: BillingDocument["documentType"],
): LedgerEntryTypeValue => {
  if (documentType === BillingDocumentType.Invoice) {
    return LedgerEntryType.Sale;
  }

  return LedgerEntryType.Purchase;
};

const resolveBalanceDirectionForDocumentType = (
  documentType: BillingDocument["documentType"],
): LedgerBalanceDirectionValue => {
  if (documentType === BillingDocumentType.Invoice) {
    return LedgerBalanceDirection.Receive;
  }

  return LedgerBalanceDirection.Pay;
};

const resolveLedgerDueAt = (document: BillingDocument): number =>
  document.dueAt ?? document.issuedAt;

const buildLedgerDueTitle = (document: BillingDocument): string => {
  if (document.documentType === BillingDocumentType.Invoice) {
    return `Invoice ${document.documentNumber}`;
  }

  return `Bill ${document.documentNumber}`;
};

const computeProjectedTotalAmount = (params: {
  taxRatePercent: number;
  items: readonly {
    quantity: number;
    unitRate: number;
  }[];
}): number => {
  const subtotalAmount = Number(
    params.items
      .reduce((sum, item) => sum + item.quantity * item.unitRate, 0)
      .toFixed(2),
  );
  const taxAmount = Number(
    ((subtotalAmount * params.taxRatePercent) / 100).toFixed(2),
  );

  return Number((subtotalAmount + taxAmount).toFixed(2));
};

const isCompatibleDueEntry = (params: {
  entry: LedgerEntry;
  documentRemoteId: string;
  expectedEntryType: LedgerEntryTypeValue;
}): boolean => {
  return (
    params.entry.entryType === params.expectedEntryType &&
    params.entry.linkedDocumentRemoteId === params.documentRemoteId
  );
};

const findExistingDueEntry = (params: {
  entries: readonly LedgerEntry[];
  documentRemoteId: string;
  linkedLedgerEntryRemoteId: string | null;
  expectedEntryType: LedgerEntryTypeValue;
}): LedgerEntry | null => {
  if (params.linkedLedgerEntryRemoteId) {
    const linkedEntry =
      params.entries.find(
        (entry) => entry.remoteId === params.linkedLedgerEntryRemoteId,
      ) ?? null;

    if (
      linkedEntry &&
      isCompatibleDueEntry({
        entry: linkedEntry,
        documentRemoteId: params.documentRemoteId,
        expectedEntryType: params.expectedEntryType,
      })
    ) {
      return linkedEntry;
    }
  }

  return (
    params.entries.find((entry) =>
      isCompatibleDueEntry({
        entry,
        documentRemoteId: params.documentRemoteId,
        expectedEntryType: params.expectedEntryType,
      }),
    ) ?? null
  );
};

const toBillingFailure = (message: string) => ({
  success: false as const,
  error: BillingValidationError(message),
});

export const createRunBillingDocumentIssueUseCase = ({
  getBillingDocumentByRemoteIdUseCase,
  saveBillingDocumentUseCase,
  deleteBillingDocumentUseCase,
  getOrCreateBusinessContactUseCase,
  getLedgerEntriesUseCase,
  addLedgerEntryUseCase,
  updateLedgerEntryUseCase,
  linkBillingDocumentLedgerEntryUseCase,
}: CreateRunBillingDocumentIssueUseCaseParams): RunBillingDocumentIssueUseCase => ({
  async execute(payload: RunBillingDocumentIssuePayload) {
    const normalizedRemoteId = normalizeRequired(payload.remoteId);
    const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
    const normalizedOwnerUserRemoteId = normalizeOptional(
      payload.ownerUserRemoteId,
    );
    const normalizedCustomerName = normalizeRequired(payload.customerName);
    const normalizedNotes = normalizeOptional(payload.notes);
    const resolvedStatus = resolveIssuedStatus(payload.desiredStatus);

    if (!normalizedRemoteId) {
      return toBillingFailure("Billing document id is required.");
    }

    if (!normalizedAccountRemoteId) {
      return toBillingFailure("Account remote id is required.");
    }

    if (!normalizedCustomerName) {
      return toBillingFailure("Customer name is required.");
    }

    if (!Number.isFinite(payload.issuedAt) || payload.issuedAt <= 0) {
      return toBillingFailure("Issued date is required.");
    }

    if (!Number.isFinite(payload.taxRatePercent) || payload.taxRatePercent < 0) {
      return toBillingFailure("Tax rate cannot be negative.");
    }

    if (payload.items.length === 0) {
      return toBillingFailure("At least one item is required.");
    }

    if (
      payload.items.some(
        (item) =>
          !item.itemName.trim() ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unitRate) ||
          item.unitRate < 0,
      )
    ) {
      return toBillingFailure(
        "All items must have a name, positive quantity, and non-negative rate.",
      );
    }

    if (
      resolvedStatus !== BillingDocumentStatus.Draft &&
      !normalizedOwnerUserRemoteId
    ) {
      return toBillingFailure(
        "User context is required to issue a billing document.",
      );
    }

    let existingDocument: BillingDocument | null = null;
    const existingDocumentResult =
      await getBillingDocumentByRemoteIdUseCase.execute(normalizedRemoteId);

    if (existingDocumentResult.success) {
      existingDocument = existingDocumentResult.value;
    } else if (
      existingDocumentResult.error.type !== BillingErrorType.DocumentNotFound
    ) {
      return toBillingFailure(existingDocumentResult.error.message);
    }

    if (
      existingDocument &&
      existingDocument.accountRemoteId !== normalizedAccountRemoteId
    ) {
      return toBillingFailure(
        "Billing document does not belong to the active account.",
      );
    }

    if (
      existingDocument &&
      existingDocument.status !== BillingDocumentStatus.Draft &&
      resolvedStatus === BillingDocumentStatus.Draft
    ) {
      return toBillingFailure(
        "Issued billing documents cannot be changed back to draft.",
      );
    }

    const projectedTotalAmount = computeProjectedTotalAmount({
      items: payload.items,
      taxRatePercent: payload.taxRatePercent,
    });

    if (
      existingDocument &&
      existingDocument.paidAmount > projectedTotalAmount + 0.0001
    ) {
      return toBillingFailure(
        "Document total cannot be less than the amount already paid.",
      );
    }

    let contactRemoteId = existingDocument?.contactRemoteId ?? null;

    if (normalizedOwnerUserRemoteId) {
      const contactResult = await getOrCreateBusinessContactUseCase.execute({
        accountRemoteId: normalizedAccountRemoteId,
        contactType: resolveContactTypeForDocumentType(payload.documentType),
        fullName: normalizedCustomerName,
        ownerUserRemoteId: normalizedOwnerUserRemoteId,
        notes: normalizedNotes,
      });

      if (contactResult.success) {
        contactRemoteId = contactResult.value.remoteId;
      } else if (resolvedStatus !== BillingDocumentStatus.Draft) {
        return toBillingFailure(contactResult.error.message);
      }
    }

    const saveResult = await saveBillingDocumentUseCase.execute({
      remoteId: normalizedRemoteId,
      accountRemoteId: normalizedAccountRemoteId,
      documentNumber:
        existingDocument?.documentNumber ??
        buildDocumentNumber({
          documentType: payload.documentType,
          remoteId: normalizedRemoteId,
          issuedAt: payload.issuedAt,
        }),
      documentType: payload.documentType,
      templateType: resolveTemplateTypeForDocumentType(payload.documentType),
      customerName: normalizedCustomerName,
      contactRemoteId,
      status: resolvedStatus,
      taxRatePercent: payload.taxRatePercent,
      notes: normalizedNotes,
      issuedAt: payload.issuedAt,
      dueAt: resolvedStatus === BillingDocumentStatus.Draft ? null : payload.dueAt,
      linkedLedgerEntryRemoteId: existingDocument?.linkedLedgerEntryRemoteId ?? null,
      items: payload.items.map((item) => ({
        ...item,
        itemName: item.itemName.trim(),
      })),
    });

    if (!saveResult.success) {
      return saveResult;
    }

    const savedDocument = saveResult.value;

    if (resolvedStatus === BillingDocumentStatus.Draft) {
      return saveResult;
    }

    const ledgerEntriesResult = await getLedgerEntriesUseCase.execute({
      businessAccountRemoteId: normalizedAccountRemoteId,
    });

    if (!ledgerEntriesResult.success) {
      if (!existingDocument) {
        await deleteBillingDocumentUseCase.execute(savedDocument.remoteId);
      }

      return toBillingFailure(ledgerEntriesResult.error.message);
    }

    const expectedDueEntryType = resolveLedgerDueEntryTypeForDocumentType(
      savedDocument.documentType,
    );

    const existingDueEntry = findExistingDueEntry({
      entries: ledgerEntriesResult.value,
      documentRemoteId: savedDocument.remoteId,
      linkedLedgerEntryRemoteId: savedDocument.linkedLedgerEntryRemoteId,
      expectedEntryType: expectedDueEntryType,
    });

    const nextLedgerPayload: SaveLedgerEntryPayload = {
      remoteId: existingDueEntry?.remoteId ?? createLedgerEntryRemoteId(),
      businessAccountRemoteId: normalizedAccountRemoteId,
      ownerUserRemoteId: normalizedOwnerUserRemoteId as string,
      partyName: savedDocument.customerName,
      partyPhone: existingDueEntry?.partyPhone ?? null,
      contactRemoteId: savedDocument.contactRemoteId,
      entryType: expectedDueEntryType,
      balanceDirection: resolveBalanceDirectionForDocumentType(
        savedDocument.documentType,
      ),
      title: buildLedgerDueTitle(savedDocument),
      amount: savedDocument.totalAmount,
      currencyCode: existingDueEntry?.currencyCode ?? null,
      note:
        savedDocument.notes ??
        existingDueEntry?.note ??
        `Issued from ${savedDocument.documentNumber}.`,
      happenedAt: savedDocument.issuedAt,
      dueAt: resolveLedgerDueAt(savedDocument),
      paymentMode: null,
      referenceNumber: savedDocument.documentNumber,
      reminderAt: existingDueEntry?.reminderAt ?? null,
      attachmentUri: existingDueEntry?.attachmentUri ?? null,
      settledAgainstEntryRemoteId:
        existingDueEntry?.settledAgainstEntryRemoteId ?? null,
      linkedDocumentRemoteId: savedDocument.remoteId,
      linkedTransactionRemoteId: existingDueEntry?.linkedTransactionRemoteId ?? null,
      settlementAccountRemoteId: null,
      settlementAccountDisplayNameSnapshot: null,
    };

    const dueResult = existingDueEntry
      ? await updateLedgerEntryUseCase.execute(nextLedgerPayload)
      : await addLedgerEntryUseCase.execute(nextLedgerPayload);

    if (!dueResult.success) {
      if (!existingDocument && !existingDueEntry) {
        await deleteBillingDocumentUseCase.execute(savedDocument.remoteId);
      }

      return toBillingFailure(dueResult.error.message);
    }

    if (savedDocument.linkedLedgerEntryRemoteId !== dueResult.value.remoteId) {
      const linkResult = await linkBillingDocumentLedgerEntryUseCase.execute(
        savedDocument.remoteId,
        dueResult.value.remoteId,
      );

      if (!linkResult.success) {
        return toBillingFailure(linkResult.error.message);
      }
    }

    const refreshedResult = await getBillingDocumentByRemoteIdUseCase.execute(
      savedDocument.remoteId,
    );

    return refreshedResult.success ? refreshedResult : saveResult;
  },
});
