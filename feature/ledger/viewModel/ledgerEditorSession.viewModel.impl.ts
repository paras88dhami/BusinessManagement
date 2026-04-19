import {
  LedgerEntry,
  LedgerEntryTypeValue,
} from "@/feature/ledger/types/ledger.entity.types";
import { useCallback, useState } from "react";
import { formatDateInput, requiresPaymentMode } from "./ledger.shared";
import {
  DEFAULT_LEDGER_EDITOR_STATE,
  LedgerEditorInternalState,
} from "./ledgerEditor.shared";
import {
  LedgerEditorSessionViewModel,
  UseLedgerEditorSessionViewModelParams,
} from "./ledgerEditorSession.viewModel";

const buildCreateState = ({
  entryType,
  partyName,
  defaultSettlementAccountRemoteId,
}: {
  entryType: LedgerEntryTypeValue;
  partyName: string;
  defaultSettlementAccountRemoteId: string;
}): LedgerEditorInternalState => {
  return {
    ...DEFAULT_LEDGER_EDITOR_STATE,
    visible: true,
    mode: "create",
    entryType,
    partyName,
    happenedAt: formatDateInput(Date.now()),
    settlementAccountRemoteId: requiresPaymentMode(entryType)
      ? defaultSettlementAccountRemoteId
      : "",
  };
};

const mapLedgerEntryToEditorState = (
  entry: LedgerEntry,
): LedgerEditorInternalState => {
  const showMoreDetails =
    (entry.referenceNumber ?? "").trim().length > 0 ||
    (entry.note ?? "").trim().length > 0 ||
    entry.reminderAt !== null ||
    (entry.attachmentUri ?? "").trim().length > 0 ||
    (entry.settledAgainstEntryRemoteId ?? "").trim().length > 0;

  return {
    visible: true,
    mode: "edit",
    editingRemoteId: entry.remoteId,
    entryType: entry.entryType,
    partyName: entry.partyName,
    amount: String(entry.amount),
    happenedAt: formatDateInput(entry.happenedAt),
    dueAt: formatDateInput(entry.dueAt),
    settlementAccountRemoteId: requiresPaymentMode(entry.entryType)
      ? (entry.settlementAccountRemoteId ?? "")
      : "",
    referenceNumber: entry.referenceNumber ?? "",
    note: entry.note ?? "",
    reminderAt: formatDateInput(entry.reminderAt),
    attachmentUri: entry.attachmentUri ?? "",
    settledAgainstEntryRemoteId: entry.settledAgainstEntryRemoteId ?? "",
    linkedDocumentRemoteId: entry.linkedDocumentRemoteId,
    linkedTransactionRemoteId: entry.linkedTransactionRemoteId,
    showMoreDetails,
    fieldErrors: {},
    isSaving: false,
    errorMessage: null,
  };
};

export const useLedgerEditorSessionViewModel = ({
  getLedgerEntryByRemoteIdUseCase,
}: UseLedgerEditorSessionViewModelParams): LedgerEditorSessionViewModel => {
  const [state, setState] = useState<LedgerEditorInternalState>(
    DEFAULT_LEDGER_EDITOR_STATE,
  );

  const openCreate = useCallback(
    (
      entryType: LedgerEntryTypeValue,
      defaultSettlementAccountRemoteId: string,
    ) => {
      setState(
        buildCreateState({
          entryType,
          partyName: "",
          defaultSettlementAccountRemoteId,
        }),
      );
    },
    [],
  );

  const openCreateForParty = useCallback(
    (
      partyName: string,
      entryType: LedgerEntryTypeValue,
      defaultSettlementAccountRemoteId: string,
    ) => {
      setState(
        buildCreateState({
          entryType,
          partyName,
          defaultSettlementAccountRemoteId,
        }),
      );
    },
    [],
  );

  const openEdit = useCallback(
    async (remoteId: string) => {
      const result = await getLedgerEntryByRemoteIdUseCase.execute(remoteId);

      if (!result.success) {
        setState((currentState) => ({
          ...currentState,
          visible: true,
          mode: "edit",
          editingRemoteId: remoteId,
          fieldErrors: {},
          errorMessage: result.error.message,
        }));
        return false;
      }

      setState(mapLedgerEntryToEditorState(result.value));
      return true;
    },
    [getLedgerEntryByRemoteIdUseCase],
  );

  const close = useCallback(() => {
    setState(DEFAULT_LEDGER_EDITOR_STATE);
  }, []);

  return {
    state,
    setState,
    openCreate,
    openCreateForParty,
    openEdit,
    close,
  };
};
