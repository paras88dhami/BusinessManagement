import {
    LedgerEntry,
    LedgerEntryTypeValue,
} from "@/feature/ledger/types/ledger.entity.types";

export type SettlementLinkCandidate = {
  remoteId: string;
  label: string;
  outstandingAmount: number;
};

export type BuildSettlementLinkCandidatesPayload = {
  entries: readonly LedgerEntry[];
  settlementEntryType: LedgerEntryTypeValue;
  partyName: string;
  fallbackCurrencyCode: string | null;
  countryCode?: string | null;
};

export interface BuildSettlementLinkCandidatesUseCase {
  execute(
    payload: BuildSettlementLinkCandidatesPayload,
  ): Promise<SettlementLinkCandidate[]>;
}
