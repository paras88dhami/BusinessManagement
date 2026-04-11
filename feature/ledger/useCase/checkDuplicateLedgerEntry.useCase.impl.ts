import {
    CheckDuplicateLedgerEntryPayload,
    CheckDuplicateLedgerEntryResult,
    CheckDuplicateLedgerEntryUseCase,
} from "./checkDuplicateLedgerEntry.useCase";

const normalizePartyName = (value: string): string =>
  value.trim().toLowerCase();

const formatDateForComparison = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0];
};

class CheckDuplicateLedgerEntryUseCaseImpl implements CheckDuplicateLedgerEntryUseCase {
  async execute(
    payload: CheckDuplicateLedgerEntryPayload,
  ): Promise<CheckDuplicateLedgerEntryResult> {
    const normalizedPartyName = normalizePartyName(payload.partyName);
    const normalizedDate = formatDateForComparison(payload.happenedAt);

    const matchingEntry = payload.entries.find((entry) => {
      // Exclude the entry being edited
      if (
        payload.editingRemoteId &&
        entry.remoteId === payload.editingRemoteId
      ) {
        return false;
      }

      // Match on entry type, party name, amount, and date
      return (
        entry.entryType === payload.entryType &&
        normalizePartyName(entry.partyName) === normalizedPartyName &&
        Math.abs(entry.amount - payload.amount) < 0.0001 &&
        formatDateForComparison(entry.happenedAt) === normalizedDate
      );
    });

    if (matchingEntry) {
      return {
        isDuplicate: true,
        matchingEntry,
      };
    }

    return {
      isDuplicate: false,
    };
  }
}

export const createCheckDuplicateLedgerEntryUseCase =
  (): CheckDuplicateLedgerEntryUseCase =>
    new CheckDuplicateLedgerEntryUseCaseImpl();
