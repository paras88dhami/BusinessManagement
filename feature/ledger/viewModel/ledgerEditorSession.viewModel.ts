import { LedgerEntryTypeValue } from "@/feature/ledger/types/ledger.entity.types";
import { GetLedgerEntryByRemoteIdUseCase } from "@/feature/ledger/useCase/getLedgerEntryByRemoteId.useCase";
import { Dispatch, SetStateAction } from "react";
import { LedgerEditorInternalState } from "./ledgerEditor.shared";

export type UseLedgerEditorSessionViewModelParams = {
  getLedgerEntryByRemoteIdUseCase: GetLedgerEntryByRemoteIdUseCase;
};

export interface LedgerEditorSessionViewModel {
  state: LedgerEditorInternalState;
  setState: Dispatch<SetStateAction<LedgerEditorInternalState>>;
  openCreate: (
    entryType: LedgerEntryTypeValue,
    defaultSettlementAccountRemoteId: string,
  ) => void;
  openCreateForParty: (
    partyName: string,
    entryType: LedgerEntryTypeValue,
    defaultSettlementAccountRemoteId: string,
  ) => void;
  openEdit: (remoteId: string) => Promise<boolean>;
  close: () => void;
}
