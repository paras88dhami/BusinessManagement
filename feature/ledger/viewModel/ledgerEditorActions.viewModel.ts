import { GetOrCreateBusinessContactUseCase } from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase";
import { CheckDuplicateLedgerEntryUseCase } from "@/feature/ledger/useCase/checkDuplicateLedgerEntry.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { SaveLedgerEntryWithSettlementUseCase } from "@/feature/ledger/useCase/saveLedgerEntryWithSettlement.useCase";
import { BuildSettlementLinkCandidatesUseCase } from "@/feature/ledger/useCase/buildSettlementLinkCandidates.useCase";
import {
  Dispatch,
  SetStateAction,
} from "react";
import { LedgerEntryTypeValue } from "@/feature/ledger/types/ledger.entity.types";
import { LedgerEditorInternalState } from "./ledgerEditor.shared";

export type UseLedgerEditorActionsViewModelParams = {
  state: LedgerEditorInternalState;
  setState: Dispatch<SetStateAction<LedgerEditorInternalState>>;
  ownerUserRemoteId: string;
  activeBusinessAccountRemoteId: string | null;
  activeBusinessAccountDisplayName: string;
  activeBusinessCurrencyCode: string | null;
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase;
  getOrCreateBusinessContactUseCase: GetOrCreateBusinessContactUseCase;
  saveLedgerEntryWithSettlementUseCase: SaveLedgerEntryWithSettlementUseCase;
  checkDuplicateLedgerEntryUseCase: CheckDuplicateLedgerEntryUseCase;
  buildSettlementLinkCandidatesUseCase: BuildSettlementLinkCandidatesUseCase;
  resolveDefaultSettlementAccountRemoteId: () => string;
  close: () => void;
  onSaved: () => void;
};

export interface LedgerEditorActionsViewModel {
  onChangeEntryType: (entryType: LedgerEntryTypeValue) => void;
  onSelectPartySuggestion: (partyName: string) => void;
  onChangePartyName: (partyName: string) => void;
  onChangeAmount: (amount: string) => void;
  onChangeHappenedAt: (happenedAt: string) => void;
  onChangeDueAt: (dueAt: string) => void;
  onChangeSettlementAccountRemoteId: (settlementAccountRemoteId: string) => void;
  onChangeSettledAgainstEntryRemoteId: (
    settledAgainstEntryRemoteId: string,
  ) => void;
  onChangeReferenceNumber: (referenceNumber: string) => void;
  onChangeNote: (note: string) => void;
  onChangeReminderAt: (reminderAt: string) => void;
  onToggleMoreDetails: () => void;
  pickAttachment: () => Promise<void>;
  clearAttachment: () => void;
  submit: () => Promise<void>;
}
