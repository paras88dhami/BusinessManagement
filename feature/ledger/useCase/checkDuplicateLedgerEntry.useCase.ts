import {
    LedgerEntry,
    LedgerEntryTypeValue,
} from "@/feature/ledger/types/ledger.entity.types";

export type CheckDuplicateLedgerEntryPayload = {
  entries: readonly LedgerEntry[];
  editingRemoteId: string | null;
  entryType: LedgerEntryTypeValue;
  partyName: string;
  amount: number;
  happenedAt: number;
};

export type CheckDuplicateLedgerEntryResult =
  | {
      isDuplicate: false;
      matchingEntry?: undefined;
    }
  | {
      isDuplicate: true;
      matchingEntry: LedgerEntry;
    };

export interface CheckDuplicateLedgerEntryUseCase {
  execute(
    payload: CheckDuplicateLedgerEntryPayload,
  ): Promise<CheckDuplicateLedgerEntryResult>;
}
