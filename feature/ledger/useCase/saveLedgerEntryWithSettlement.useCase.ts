import {
  LedgerEntry,
  LedgerEntryResult,
  SaveLedgerEntryPayload,
} from "@/feature/ledger/types/ledger.entity.types";

export const INVALID_LEDGER_SETTLEMENT_ACCOUNT_MESSAGE =
  "Choose a valid active money account.";

export type SaveLedgerEntryWithSettlementMode = "create" | "update";

export type LedgerSettlementAllocationCandidate = {
  remoteId: string;
  outstandingAmount: number;
};

export type SaveLedgerEntryWithSettlementPayload = {
  mode: SaveLedgerEntryWithSettlementMode;
  businessAccountDisplayName: string;
  selectedSettlementAccountRemoteId: string | null;
  ledgerEntry: SaveLedgerEntryPayload;
  existingLedgerEntries: readonly LedgerEntry[];
  settlementCandidates: readonly LedgerSettlementAllocationCandidate[];
};

export interface SaveLedgerEntryWithSettlementUseCase {
  execute(
    payload: SaveLedgerEntryWithSettlementPayload,
  ): Promise<LedgerEntryResult>;
}
