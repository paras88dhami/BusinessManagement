import { resolveCurrencyCode } from "@/shared/utils/currency/accountCurrency";
import { pickImageFromLibrary } from "@/shared/utils/media/pickImage";
import { useCallback } from "react";
import {
  LedgerEditorFieldErrors,
} from "@/feature/ledger/types/ledger.state.types";
import {
  LedgerEntryTypeValue,
  SaveLedgerEntryPayload,
} from "@/feature/ledger/types/ledger.entity.types";
import {
  INVALID_LEDGER_SETTLEMENT_ACCOUNT_MESSAGE,
} from "@/feature/ledger/useCase/saveLedgerEntryWithSettlement.useCase";
import {
  parseDateInput,
  requiresDueDate,
  requiresPaymentMode,
  resolveDefaultDirectionForEntryType,
} from "./ledger.shared";
import {
  buildAutoTitle,
  clearFieldError,
  createLedgerRemoteId,
  resolveContactTypeForEntryType,
} from "./ledgerEditor.shared";
import {
  LedgerEditorActionsViewModel,
  UseLedgerEditorActionsViewModelParams,
} from "./ledgerEditorActions.viewModel";

export const useLedgerEditorActionsViewModel = ({
  state,
  setState,
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
}: UseLedgerEditorActionsViewModelParams): LedgerEditorActionsViewModel => {
  const onChangeEntryType = useCallback(
    (entryType: LedgerEntryTypeValue) => {
      setState((currentState) => {
        const requiresSettlementAccount = requiresPaymentMode(entryType);

        return {
          ...currentState,
          entryType,
          dueAt: requiresDueDate(entryType) ? currentState.dueAt : "",
          settledAgainstEntryRemoteId: "",
          settlementAccountRemoteId: requiresSettlementAccount
            ? currentState.settlementAccountRemoteId ||
              resolveDefaultSettlementAccountRemoteId()
            : "",
          fieldErrors: {
            ...currentState.fieldErrors,
            dueAt: undefined,
            settlementAccountRemoteId: undefined,
            settledAgainstEntryRemoteId: undefined,
          },
          errorMessage: null,
        };
      });
    },
    [resolveDefaultSettlementAccountRemoteId, setState],
  );

  const pickAttachment = useCallback(async () => {
    const pickedImage = await pickImageFromLibrary();

    if (!pickedImage) {
      return;
    }

    setState((currentState) => ({
      ...currentState,
      attachmentUri: pickedImage.uri,
      showMoreDetails: true,
      fieldErrors: clearFieldError(currentState.fieldErrors, "reminderAt"),
      errorMessage: null,
    }));
  }, [setState]);

  const submit = useCallback(async () => {
    const normalizedPartyName = state.partyName.trim();
    const amount = Number(state.amount);
    const happenedAt = parseDateInput(state.happenedAt);
    const dueAt = parseDateInput(state.dueAt);
    const reminderAt = parseDateInput(state.reminderAt);
    const nextFieldErrors: LedgerEditorFieldErrors = {};

    if (!normalizedPartyName) {
      nextFieldErrors.partyName = "Party name is required.";
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      nextFieldErrors.amount = "Amount must be greater than zero.";
    }

    if (happenedAt === null) {
      nextFieldErrors.happenedAt = "Enter a valid date in YYYY-MM-DD format.";
    }

    if (requiresDueDate(state.entryType) && dueAt === null) {
      nextFieldErrors.dueAt = "Due date is required for this action.";
    }

    if (
      !requiresDueDate(state.entryType) &&
      state.dueAt.trim().length > 0 &&
      dueAt === null
    ) {
      nextFieldErrors.dueAt = "Enter a valid due date in YYYY-MM-DD format.";
    }

    if (
      requiresPaymentMode(state.entryType) &&
      state.settlementAccountRemoteId.trim().length === 0
    ) {
      nextFieldErrors.settlementAccountRemoteId =
        "Money account is required for this action.";
    }

    if (state.reminderAt.trim().length > 0 && reminderAt === null) {
      nextFieldErrors.reminderAt =
        "Enter a valid reminder date in YYYY-MM-DD format.";
    }

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setState((currentState) => ({
        ...currentState,
        fieldErrors: nextFieldErrors,
        errorMessage: null,
      }));
      return;
    }

    const businessAccountRemoteId = activeBusinessAccountRemoteId ?? "";

    if (!businessAccountRemoteId) {
      setState((currentState) => ({
        ...currentState,
        fieldErrors: {},
        errorMessage: "Business account context is required.",
      }));
      return;
    }

    const duplicateCheckResult = await getLedgerEntriesUseCase.execute({
      businessAccountRemoteId,
    });

    if (!duplicateCheckResult.success) {
      setState((currentState) => ({
        ...currentState,
        fieldErrors: {},
        errorMessage: duplicateCheckResult.error.message,
      }));
      return;
    }

    const checkDuplicateResult = await checkDuplicateLedgerEntryUseCase.execute(
      {
        entries: duplicateCheckResult.value,
        editingRemoteId: state.mode === "edit" ? state.editingRemoteId : null,
        entryType: state.entryType,
        partyName: normalizedPartyName,
        amount,
        happenedAt: happenedAt as number,
      },
    );

    if (checkDuplicateResult.isDuplicate) {
      setState((currentState) => ({
        ...currentState,
        fieldErrors: {
          ...currentState.fieldErrors,
          partyName:
            "A similar entry already exists for this party/date/amount.",
        },
        errorMessage: null,
      }));
      return;
    }

    const isSettlementAction = requiresPaymentMode(state.entryType);
    const isDueAction = requiresDueDate(state.entryType);
    const settlementCandidates =
      await buildSettlementLinkCandidatesUseCase.execute({
        entries: duplicateCheckResult.value,
        settlementEntryType: state.entryType,
        partyName: normalizedPartyName,
        fallbackCurrencyCode: activeBusinessCurrencyCode,
      });
    const settlementCandidatesById = new Map(
      settlementCandidates.map((candidate) => [candidate.remoteId, candidate]),
    );
    let resolvedSettledAgainstEntryRemoteId = isSettlementAction
      ? state.settledAgainstEntryRemoteId.trim() || null
      : null;

    if (isSettlementAction) {
      const totalOutstandingAmount = settlementCandidates.reduce(
        (total, candidate) => total + candidate.outstandingAmount,
        0,
      );

      if (totalOutstandingAmount <= 0.0001) {
        nextFieldErrors.partyName =
          "No pending due found for this party. Create due entry first.";
      } else if (amount > totalOutstandingAmount + 0.0001) {
        nextFieldErrors.amount =
          "Amount is more than pending due for this party. Use a due action for advance.";
      }

      if (resolvedSettledAgainstEntryRemoteId) {
        const linkedCandidate = settlementCandidatesById.get(
          resolvedSettledAgainstEntryRemoteId,
        );

        if (!linkedCandidate) {
          resolvedSettledAgainstEntryRemoteId = null;
        } else if (amount > linkedCandidate.outstandingAmount + 0.0001) {
          resolvedSettledAgainstEntryRemoteId = null;
        }
      } else if (settlementCandidates.length === 1) {
        resolvedSettledAgainstEntryRemoteId = settlementCandidates[0].remoteId;
      }
    }

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setState((currentState) => ({
        ...currentState,
        fieldErrors: nextFieldErrors,
        errorMessage: null,
      }));
      return;
    }

    setState((currentState) => ({
      ...currentState,
      isSaving: true,
      fieldErrors: {},
      errorMessage: null,
    }));

    const resolvedDueAt = isDueAction
      ? (dueAt as number)
      : state.dueAt.trim().length === 0
        ? null
        : dueAt;
    const resolvedHappenedAt = happenedAt as number;
    const resolvedReminderAt =
      state.reminderAt.trim().length === 0 ? null : reminderAt;
    const selectedSettlementAccountRemoteId =
      state.settlementAccountRemoteId.trim();

    const resolvedCurrencyCode = resolveCurrencyCode({
      currencyCode: activeBusinessCurrencyCode,
    });

    const transactionNote = state.note.trim() || null;
    const ledgerRemoteId =
      state.mode === "create"
        ? createLedgerRemoteId()
        : (state.editingRemoteId ?? "");
    if (!ledgerRemoteId) {
      setState((currentState) => ({
        ...currentState,
        isSaving: false,
        fieldErrors: {},
        errorMessage: "Ledger entry id is missing.",
      }));
      return;
    }

    const expectedContactType = resolveContactTypeForEntryType(state.entryType);
    const contactResult = await getOrCreateBusinessContactUseCase.execute({
      accountRemoteId: businessAccountRemoteId,
      contactType: expectedContactType,
      fullName: normalizedPartyName,
      ownerUserRemoteId,
      notes: null,
    });

    if (!contactResult.success) {
      setState((currentState) => ({
        ...currentState,
        isSaving: false,
        fieldErrors: {},
        errorMessage: contactResult.error.message,
      }));
      return;
    }

    const payload: SaveLedgerEntryPayload = {
      remoteId: ledgerRemoteId,
      businessAccountRemoteId,
      ownerUserRemoteId,
      partyName: normalizedPartyName,
      partyPhone: null,
      contactRemoteId: contactResult.value.remoteId,
      entryType: state.entryType,
      balanceDirection: resolveDefaultDirectionForEntryType(state.entryType),
      title: buildAutoTitle(state.entryType, normalizedPartyName),
      amount,
      currencyCode: resolvedCurrencyCode,
      note: transactionNote,
      happenedAt: resolvedHappenedAt,
      dueAt: resolvedDueAt,
      paymentMode: null,
      referenceNumber: state.referenceNumber.trim() || null,
      reminderAt: resolvedReminderAt,
      attachmentUri: state.attachmentUri.trim() || null,
      settledAgainstEntryRemoteId: resolvedSettledAgainstEntryRemoteId,
      linkedDocumentRemoteId: state.linkedDocumentRemoteId,
      linkedTransactionRemoteId: state.linkedTransactionRemoteId,
      settlementAccountRemoteId: null,
      settlementAccountDisplayNameSnapshot: null,
    };

    const result = await saveLedgerEntryWithSettlementUseCase.execute({
      mode: state.mode === "create" ? "create" : "update",
      businessAccountDisplayName: activeBusinessAccountDisplayName,
      selectedSettlementAccountRemoteId:
        selectedSettlementAccountRemoteId || null,
      ledgerEntry: payload,
      existingLedgerEntries: duplicateCheckResult.value,
      settlementCandidates,
    });

    if (!result.success) {
      const isInvalidSettlementAccount =
        result.error.message === INVALID_LEDGER_SETTLEMENT_ACCOUNT_MESSAGE;

      setState((currentState) => ({
        ...currentState,
        isSaving: false,
        fieldErrors: isInvalidSettlementAccount
          ? {
              ...currentState.fieldErrors,
              settlementAccountRemoteId: result.error.message,
            }
          : {},
        errorMessage: isInvalidSettlementAccount ? null : result.error.message,
      }));
      return;
    }

    close();
    onSaved();
  }, [
    activeBusinessAccountDisplayName,
    activeBusinessAccountRemoteId,
    activeBusinessCurrencyCode,
    buildSettlementLinkCandidatesUseCase,
    checkDuplicateLedgerEntryUseCase,
    close,
    getOrCreateBusinessContactUseCase,
    getLedgerEntriesUseCase,
    onSaved,
    ownerUserRemoteId,
    saveLedgerEntryWithSettlementUseCase,
    setState,
    state.amount,
    state.attachmentUri,
    state.dueAt,
    state.editingRemoteId,
    state.entryType,
    state.happenedAt,
    state.linkedDocumentRemoteId,
    state.linkedTransactionRemoteId,
    state.mode,
    state.note,
    state.partyName,
    state.referenceNumber,
    state.reminderAt,
    state.settlementAccountRemoteId,
    state.settledAgainstEntryRemoteId,
  ]);

  return {
    onChangeEntryType,
    onSelectPartySuggestion: (partyName: string) =>
      setState((currentState) => ({
        ...currentState,
        partyName,
        settledAgainstEntryRemoteId: "",
        fieldErrors: {
          ...currentState.fieldErrors,
          partyName: undefined,
          settledAgainstEntryRemoteId: undefined,
        },
        errorMessage: null,
      })),
    onChangePartyName: (partyName: string) =>
      setState((currentState) => ({
        ...currentState,
        partyName,
        settledAgainstEntryRemoteId: "",
        fieldErrors: {
          ...currentState.fieldErrors,
          partyName: undefined,
          settledAgainstEntryRemoteId: undefined,
        },
        errorMessage: null,
      })),
    onChangeAmount: (amount: string) =>
      setState((currentState) => ({
        ...currentState,
        amount,
        fieldErrors: {
          ...currentState.fieldErrors,
          amount: undefined,
          settledAgainstEntryRemoteId: undefined,
        },
        errorMessage: null,
      })),
    onChangeHappenedAt: (happenedAt: string) =>
      setState((currentState) => ({
        ...currentState,
        happenedAt,
        fieldErrors: {
          ...currentState.fieldErrors,
          happenedAt: undefined,
        },
        errorMessage: null,
      })),
    onChangeDueAt: (dueAt: string) =>
      setState((currentState) => ({
        ...currentState,
        dueAt,
        fieldErrors: {
          ...currentState.fieldErrors,
          dueAt: undefined,
        },
        errorMessage: null,
      })),
    onChangeSettlementAccountRemoteId: (settlementAccountRemoteId: string) =>
      setState((currentState) => ({
        ...currentState,
        settlementAccountRemoteId,
        fieldErrors: {
          ...currentState.fieldErrors,
          settlementAccountRemoteId: undefined,
        },
        errorMessage: null,
      })),
    onChangeSettledAgainstEntryRemoteId: (settledAgainstEntryRemoteId: string) =>
      setState((currentState) => ({
        ...currentState,
        settledAgainstEntryRemoteId,
        fieldErrors: {
          ...currentState.fieldErrors,
          settledAgainstEntryRemoteId: undefined,
        },
        errorMessage: null,
      })),
    onChangeReferenceNumber: (referenceNumber: string) =>
      setState((currentState) => ({
        ...currentState,
        referenceNumber,
        errorMessage: null,
      })),
    onChangeNote: (note: string) =>
      setState((currentState) => ({
        ...currentState,
        note,
        errorMessage: null,
      })),
    onChangeReminderAt: (reminderAt: string) =>
      setState((currentState) => ({
        ...currentState,
        reminderAt,
        fieldErrors: {
          ...currentState.fieldErrors,
          reminderAt: undefined,
        },
        errorMessage: null,
      })),
    onToggleMoreDetails: () =>
      setState((currentState) => ({
        ...currentState,
        showMoreDetails: !currentState.showMoreDetails,
      })),
    pickAttachment,
    clearAttachment: () =>
      setState((currentState) => ({
        ...currentState,
        attachmentUri: "",
        errorMessage: null,
      })),
    submit,
  };
};
