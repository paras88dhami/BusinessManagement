import {
  LedgerEntryTypeValue,
  LedgerPaymentModeValue,
} from "@/feature/ledger/types/ledger.entity.types";
import {
  LedgerEditorFormState,
  LedgerEntryTypeOptionState,
  LedgerPaymentModeOptionState,
} from "@/feature/ledger/types/ledger.state.types";

export interface LedgerEditorViewModel {
  state: LedgerEditorFormState;
  availableEntryTypes: readonly LedgerEntryTypeOptionState[];
  availablePaymentModes: readonly LedgerPaymentModeOptionState[];
  openCreate: (entryType: LedgerEntryTypeValue) => void;
  openCreateForParty: (
    partyName: string,
    entryType: LedgerEntryTypeValue,
  ) => void;
  openEdit: (remoteId: string) => Promise<void>;
  close: () => void;
  onChangeEntryType: (entryType: LedgerEntryTypeValue) => void;
  onChangePartyName: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onChangeHappenedAt: (value: string) => void;
  onChangeDueAt: (value: string) => void;
  onChangePaymentMode: (value: LedgerPaymentModeValue | "") => void;
  onChangeReferenceNumber: (value: string) => void;
  onChangeNote: (value: string) => void;
  onChangeReminderAt: (value: string) => void;
  onToggleMoreDetails: () => void;
  pickAttachment: () => Promise<void>;
  clearAttachment: () => void;
  submit: () => Promise<void>;
}
