import { LedgerRepository } from "@/feature/ledger/data/repository/ledger.repository";
import {
    LedgerEntryResult,
    LedgerEntryType,
    SaveLedgerEntryPayload,
} from "@/feature/ledger/types/ledger.entity.types";
import { LedgerValidationError } from "@/feature/ledger/types/ledger.error.types";
import { AddLedgerEntryUseCase } from "./addLedgerEntry.useCase";

export const createAddLedgerEntryUseCase = (
  ledgerRepository: LedgerRepository,
): AddLedgerEntryUseCase => ({
  async execute(payload: SaveLedgerEntryPayload): Promise<LedgerEntryResult> {
    if (!payload.remoteId.trim()) {
      return {
        success: false,
        error: LedgerValidationError("Ledger entry id is required."),
      };
    }

    if (!payload.businessAccountRemoteId.trim()) {
      return {
        success: false,
        error: LedgerValidationError("Business account is required."),
      };
    }

    if (!payload.ownerUserRemoteId.trim()) {
      return {
        success: false,
        error: LedgerValidationError("User context is required."),
      };
    }

    if (!payload.partyName.trim()) {
      return {
        success: false,
        error: LedgerValidationError("Party name is required."),
      };
    }

    if (!payload.title.trim()) {
      return {
        success: false,
        error: LedgerValidationError("Entry title is required."),
      };
    }

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      return {
        success: false,
        error: LedgerValidationError("Amount must be greater than zero."),
      };
    }

    const requiresDueDate =
      payload.entryType === LedgerEntryType.Sale ||
      payload.entryType === LedgerEntryType.Purchase;
    const requiresSettlementAccount =
      payload.entryType === LedgerEntryType.Collection ||
      payload.entryType === LedgerEntryType.PaymentOut;

    if (requiresDueDate && payload.dueAt === null) {
      return {
        success: false,
        error: LedgerValidationError("Due date is required for due entries."),
      };
    }

    if (requiresSettlementAccount && !payload.settlementAccountRemoteId) {
      return {
        success: false,
        error: LedgerValidationError("Settlement account is required for payment entries."),
      };
    }

    return ledgerRepository.saveLedgerEntry(payload);
  },

  async verifyLinkedDocument(
    billingDocumentRemoteId: string,
    expectedLedgerEntryRemoteId: string,
  ): Promise<LedgerEntryResult> {
    if (!billingDocumentRemoteId?.trim() || !expectedLedgerEntryRemoteId?.trim()) {
      return {
        success: false,
        error: LedgerValidationError("Document and ledger remote IDs are required for verification."),
      };
    }

    const result = await ledgerRepository.getLedgerEntryByLinkedDocumentRemoteId(
      billingDocumentRemoteId,
    );

    if (!result.success) {
      return result;
    }

    if (!result.value) {
      return {
        success: false,
        error: LedgerValidationError("No ledger entry found linked to this billing document."),
      };
    }

    if (result.value.remoteId !== expectedLedgerEntryRemoteId) {
      return {
        success: false,
        error: LedgerValidationError("Ledger entry remote ID mismatch in billing linkage."),
      };
    }

    return {
      success: true,
      value: result.value,
    };
  },
});
