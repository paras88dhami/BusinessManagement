import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { GetOrCreateBusinessContactUseCase } from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase";
import { LedgerEntryTypeValue } from "@/feature/ledger/types/ledger.entity.types";
import { LedgerEditorFormState } from "@/feature/ledger/types/ledger.state.types";
import { BuildSettlementLinkCandidatesUseCase } from "@/feature/ledger/useCase/buildSettlementLinkCandidates.useCase";
import { CheckDuplicateLedgerEntryUseCase } from "@/feature/ledger/useCase/checkDuplicateLedgerEntry.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { GetLedgerEntryByRemoteIdUseCase } from "@/feature/ledger/useCase/getLedgerEntryByRemoteId.useCase";
import { SaveLedgerEntryWithSettlementUseCase } from "@/feature/ledger/useCase/saveLedgerEntryWithSettlement.useCase";
import { useCallback, useMemo } from "react";
import { LEDGER_EDITOR_ENTRY_TYPE_OPTIONS } from "./ledgerEditor.shared";
import { useLedgerEditorActionsViewModel } from "./ledgerEditorActions.viewModel.impl";
import { useLedgerEditorLookupViewModel } from "./ledgerEditorLookup.viewModel.impl";
import { useLedgerEditorSessionViewModel } from "./ledgerEditorSession.viewModel.impl";
import { LedgerEditorViewModel } from "./ledgerEditor.viewModel";

type UseLedgerEditorViewModelParams = {
  ownerUserRemoteId: string;
  activeBusinessAccountRemoteId: string | null;
  activeBusinessAccountDisplayName: string;
  activeBusinessCurrencyCode: string | null;
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase;
  getLedgerEntryByRemoteIdUseCase: GetLedgerEntryByRemoteIdUseCase;
  getOrCreateBusinessContactUseCase: GetOrCreateBusinessContactUseCase;
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase;
  saveLedgerEntryWithSettlementUseCase: SaveLedgerEntryWithSettlementUseCase;
  checkDuplicateLedgerEntryUseCase: CheckDuplicateLedgerEntryUseCase;
  buildSettlementLinkCandidatesUseCase: BuildSettlementLinkCandidatesUseCase;
  onSaved: () => void;
};

export const useLedgerEditorViewModel = ({
  ownerUserRemoteId,
  activeBusinessAccountRemoteId,
  activeBusinessAccountDisplayName,
  activeBusinessCurrencyCode,
  getLedgerEntriesUseCase,
  getLedgerEntryByRemoteIdUseCase,
  getOrCreateBusinessContactUseCase,
  getMoneyAccountsUseCase,
  saveLedgerEntryWithSettlementUseCase,
  checkDuplicateLedgerEntryUseCase,
  buildSettlementLinkCandidatesUseCase,
  onSaved,
}: UseLedgerEditorViewModelParams): LedgerEditorViewModel => {
  const {
    state: internalState,
    setState: setInternalState,
    openCreate: openCreateSession,
    openCreateForParty: openCreateForPartySession,
    openEdit: openEditSession,
    close,
  } = useLedgerEditorSessionViewModel({
    getLedgerEntryByRemoteIdUseCase,
  });

  const {
    partySuggestions,
    availableSettlementAccounts,
    settlementLinkOptions,
    loadKnownParties,
    loadMoneyAccounts,
    resolveDefaultSettlementAccountRemoteId,
  } = useLedgerEditorLookupViewModel({
    activeBusinessAccountRemoteId,
    activeBusinessCurrencyCode,
    state: internalState,
    setState: setInternalState,
    getLedgerEntriesUseCase,
    getMoneyAccountsUseCase,
    buildSettlementLinkCandidatesUseCase,
  });

  const openCreate = useCallback(
    (entryType: LedgerEntryTypeValue) => {
      openCreateSession(entryType, resolveDefaultSettlementAccountRemoteId());
      void loadKnownParties();
      void loadMoneyAccounts();
    },
    [
      loadKnownParties,
      loadMoneyAccounts,
      openCreateSession,
      resolveDefaultSettlementAccountRemoteId,
    ],
  );

  const openCreateForParty = useCallback(
    (partyName: string, entryType: LedgerEntryTypeValue) => {
      openCreateForPartySession(
        partyName,
        entryType,
        resolveDefaultSettlementAccountRemoteId(),
      );
      void loadKnownParties();
      void loadMoneyAccounts();
    },
    [
      loadKnownParties,
      loadMoneyAccounts,
      openCreateForPartySession,
      resolveDefaultSettlementAccountRemoteId,
    ],
  );

  const openEdit = useCallback(
    async (remoteId: string) => {
      const didOpen = await openEditSession(remoteId);
      if (!didOpen) {
        return;
      }

      void loadKnownParties();
      void loadMoneyAccounts();
    },
    [loadKnownParties, loadMoneyAccounts, openEditSession],
  );

  const actions = useLedgerEditorActionsViewModel({
    state: internalState,
    setState: setInternalState,
    ownerUserRemoteId,
    activeBusinessAccountRemoteId,
    activeBusinessAccountDisplayName,
    activeBusinessCurrencyCode,
    getLedgerEntriesUseCase,
    getOrCreateBusinessContactUseCase,
    saveLedgerEntryWithSettlementUseCase,
    checkDuplicateLedgerEntryUseCase,
    buildSettlementLinkCandidatesUseCase,
    resolveDefaultSettlementAccountRemoteId,
    close,
    onSaved,
  });

  const viewState = useMemo<LedgerEditorFormState>(
    () => ({
      visible: internalState.visible,
      mode: internalState.mode,
      entryType: internalState.entryType,
      partyName: internalState.partyName,
      amount: internalState.amount,
      happenedAt: internalState.happenedAt,
      dueAt: internalState.dueAt,
      settlementAccountRemoteId: internalState.settlementAccountRemoteId,
      referenceNumber: internalState.referenceNumber,
      note: internalState.note,
      reminderAt: internalState.reminderAt,
      attachmentUri: internalState.attachmentUri,
      settledAgainstEntryRemoteId: internalState.settledAgainstEntryRemoteId,
      showMoreDetails: internalState.showMoreDetails,
      fieldErrors: internalState.fieldErrors,
      isSaving: internalState.isSaving,
      errorMessage: internalState.errorMessage,
    }),
    [internalState],
  );

  return useMemo(
    () => ({
      state: viewState,
      partySuggestions,
      availableEntryTypes: LEDGER_EDITOR_ENTRY_TYPE_OPTIONS,
      availableSettlementAccounts,
      settlementLinkOptions,
      openCreate,
      openCreateForParty,
      openEdit,
      close,
      onChangeEntryType: actions.onChangeEntryType,
      onSelectPartySuggestion: actions.onSelectPartySuggestion,
      onChangePartyName: actions.onChangePartyName,
      onChangeAmount: actions.onChangeAmount,
      onChangeHappenedAt: actions.onChangeHappenedAt,
      onChangeDueAt: actions.onChangeDueAt,
      onChangeSettlementAccountRemoteId:
        actions.onChangeSettlementAccountRemoteId,
      onChangeSettledAgainstEntryRemoteId:
        actions.onChangeSettledAgainstEntryRemoteId,
      onChangeReferenceNumber: actions.onChangeReferenceNumber,
      onChangeNote: actions.onChangeNote,
      onChangeReminderAt: actions.onChangeReminderAt,
      onToggleMoreDetails: actions.onToggleMoreDetails,
      pickAttachment: actions.pickAttachment,
      clearAttachment: actions.clearAttachment,
      submit: actions.submit,
    }),
    [
      actions.clearAttachment,
      actions.onChangeAmount,
      actions.onChangeDueAt,
      actions.onChangeEntryType,
      actions.onChangeHappenedAt,
      actions.onChangeNote,
      actions.onChangePartyName,
      actions.onChangeReferenceNumber,
      actions.onChangeReminderAt,
      actions.onChangeSettlementAccountRemoteId,
      actions.onChangeSettledAgainstEntryRemoteId,
      actions.onSelectPartySuggestion,
      actions.onToggleMoreDetails,
      actions.pickAttachment,
      actions.submit,
      availableSettlementAccounts,
      close,
      partySuggestions,
      openCreate,
      openCreateForParty,
      openEdit,
      settlementLinkOptions,
      viewState,
    ],
  );
};
