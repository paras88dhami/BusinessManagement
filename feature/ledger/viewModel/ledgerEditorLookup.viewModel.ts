import {
  LedgerAccountOptionState,
  LedgerSettlementLinkOptionState,
} from "@/feature/ledger/types/ledger.state.types";
import { BuildSettlementLinkCandidatesUseCase } from "@/feature/ledger/useCase/buildSettlementLinkCandidates.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { Dispatch, SetStateAction } from "react";
import { LedgerEditorInternalState } from "./ledgerEditor.shared";

export type UseLedgerEditorLookupViewModelParams = {
  activeBusinessAccountRemoteId: string | null;
  activeBusinessCurrencyCode: string | null;
  state: LedgerEditorInternalState;
  setState: Dispatch<SetStateAction<LedgerEditorInternalState>>;
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase;
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase;
  buildSettlementLinkCandidatesUseCase: BuildSettlementLinkCandidatesUseCase;
};

export interface LedgerEditorLookupViewModel {
  partySuggestions: readonly string[];
  availableSettlementAccounts: readonly LedgerAccountOptionState[];
  settlementLinkOptions: readonly LedgerSettlementLinkOptionState[];
  loadKnownParties: () => Promise<void>;
  loadMoneyAccounts: () => Promise<void>;
  resolveDefaultSettlementAccountRemoteId: () => string;
}
