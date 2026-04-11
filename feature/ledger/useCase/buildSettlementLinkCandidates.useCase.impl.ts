import {
  LedgerEntry,
  LedgerEntryType,
} from "@/feature/ledger/types/ledger.entity.types";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import {
  BuildSettlementLinkCandidatesPayload,
  BuildSettlementLinkCandidatesUseCase,
  SettlementLinkCandidate,
} from "./buildSettlementLinkCandidates.useCase";

const normalizePartyName = (value: string): string =>
  value.trim().toLowerCase();

const roundCurrency = (value: number): number => Number(value.toFixed(2));

const formatDateLabel = (timestamp: number | null): string => {
  if (timestamp === null) {
    return "No due date";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDueSortTimestamp = (entry: LedgerEntry): number => {
  if (entry.dueAt !== null) {
    return entry.dueAt;
  }
  return entry.happenedAt;
};

const buildOutstandingByDueEntryRemoteId = (
  entries: readonly LedgerEntry[],
): Map<string, number> => {
  const outstandingByDueId = new Map<string, number>();
  const settledByDueId = new Map<string, number>();

  // Calculate amounts settled against each due entry
  entries.forEach((entry) => {
    if (entry.settledAgainstEntryRemoteId) {
      const currentSettled =
        settledByDueId.get(entry.settledAgainstEntryRemoteId) ?? 0;
      settledByDueId.set(
        entry.settledAgainstEntryRemoteId,
        currentSettled + entry.amount,
      );
    }
  });

  // Calculate outstanding amounts
  entries.forEach((entry) => {
    const isDueEntry =
      entry.entryType === LedgerEntryType.Sale ||
      entry.entryType === LedgerEntryType.Purchase;
    if (isDueEntry) {
      const settled = settledByDueId.get(entry.remoteId) ?? 0;
      const outstanding = entry.amount - settled;
      outstandingByDueId.set(entry.remoteId, outstanding);
    }
  });

  return outstandingByDueId;
};

const resolveDueEntryTypeForSettlement = (settlementEntryType: string) => {
  if (settlementEntryType === LedgerEntryType.Collection) {
    return LedgerEntryType.Sale;
  }

  if (settlementEntryType === LedgerEntryType.PaymentOut) {
    return LedgerEntryType.Purchase;
  }

  return null;
};

const isDueEntry = (entry: LedgerEntry): boolean =>
  entry.entryType === LedgerEntryType.Sale ||
  entry.entryType === LedgerEntryType.Purchase;

class BuildSettlementLinkCandidatesUseCaseImpl implements BuildSettlementLinkCandidatesUseCase {
  async execute(
    payload: BuildSettlementLinkCandidatesPayload,
  ): Promise<SettlementLinkCandidate[]> {
    const dueEntryType = resolveDueEntryTypeForSettlement(
      payload.settlementEntryType,
    );
    const normalizedPartyName = normalizePartyName(payload.partyName);

    if (!dueEntryType || normalizedPartyName.length === 0) {
      return [];
    }

    const outstandingByDueId = buildOutstandingByDueEntryRemoteId(
      payload.entries,
    );

    return payload.entries
      .filter(
        (entry) =>
          entry.entryType === dueEntryType &&
          normalizePartyName(entry.partyName) === normalizedPartyName &&
          isDueEntry(entry),
      )
      .sort(
        (left, right) => getDueSortTimestamp(left) - getDueSortTimestamp(right),
      )
      .map((entry) => {
        const outstandingAmount = roundCurrency(
          outstandingByDueId.get(entry.remoteId) ?? entry.amount,
        );

        if (outstandingAmount <= 0) {
          return null;
        }

        const refText = (entry.referenceNumber ?? "").trim();
        const refLabel = refText.length > 0 ? `Ref ${refText} | ` : "";
        const dueLabel =
          entry.dueAt !== null
            ? `Due ${formatDateLabel(entry.dueAt)}`
            : `Date ${formatDateLabel(entry.happenedAt)}`;
        const amountLabel = formatCurrencyAmount({
          amount: outstandingAmount,
          currencyCode: entry.currencyCode ?? payload.fallbackCurrencyCode,
          countryCode: payload.countryCode ?? null,
        });

        return {
          remoteId: entry.remoteId,
          label: `${refLabel}${dueLabel} | Pending ${amountLabel}`,
          outstandingAmount,
        };
      })
      .filter(
        (candidate): candidate is SettlementLinkCandidate => candidate !== null,
      );
  }
}

export const createBuildSettlementLinkCandidatesUseCase =
  (): BuildSettlementLinkCandidatesUseCase =>
    new BuildSettlementLinkCandidatesUseCaseImpl();
