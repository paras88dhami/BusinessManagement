import {
  LedgerEntry,
  LedgerEntryType,
  LedgerEntryTypeValue,
  LedgerPaymentMode,
  LedgerPaymentModeValue,
  SaveLedgerEntryPayload,
} from "@/feature/ledger/types/ledger.entity.types";
import {
  LedgerEditorFieldErrors,
  LedgerEditorFormState,
  LedgerEntryTypeOptionState,
  LedgerPaymentModeOptionState,
} from "@/feature/ledger/types/ledger.state.types";
import { AddLedgerEntryUseCase } from "@/feature/ledger/useCase/addLedgerEntry.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { GetLedgerEntryByRemoteIdUseCase } from "@/feature/ledger/useCase/getLedgerEntryByRemoteId.useCase";
import { UpdateLedgerEntryUseCase } from "@/feature/ledger/useCase/updateLedgerEntry.useCase";
import { useCallback, useMemo, useState } from "react";
import {
  formatDateInput,
  getLedgerEntryTypeLabel,
  parseDateInput,
  requiresDueDate,
  requiresPaymentMode,
  resolveDefaultDirectionForEntryType,
} from "./ledger.shared";
import { LedgerEditorViewModel } from "./ledgerEditor.viewModel";
import { resolveCurrencyCode } from "@/shared/utils/currency/accountCurrency";
import { pickImageFromLibrary } from "@/shared/utils/media/pickImage";
import { AddTransactionUseCase } from "@/feature/transactions/useCase/addTransaction.useCase";
import { UpdateTransactionUseCase } from "@/feature/transactions/useCase/updateTransaction.useCase";
import { DeleteTransactionUseCase } from "@/feature/transactions/useCase/deleteTransaction.useCase";
import {
  SaveTransactionPayload,
  TransactionDirection,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";

const DEFAULT_LEDGER_STATE: LedgerEditorFormState = {
  visible: false,
  mode: "create",
  editingRemoteId: null,
  entryType: LedgerEntryType.Sale,
  partyName: "",
  amount: "",
  happenedAt: formatDateInput(Date.now()),
  dueAt: "",
  paymentMode: "",
  referenceNumber: "",
  note: "",
  reminderAt: "",
  attachmentUri: "",
  linkedTransactionRemoteId: null,
  showMoreDetails: false,
  fieldErrors: {},
  isSaving: false,
  errorMessage: null,
};

const createLedgerRemoteId = (): string => {
  return `led-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createTransactionRemoteId = (): string => {
  return `txn-ledger-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

type UseLedgerEditorViewModelParams = {
  ownerUserRemoteId: string;
  activeBusinessAccountRemoteId: string | null;
  activeBusinessAccountDisplayName: string;
  activeBusinessCurrencyCode: string | null;
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase;
  getLedgerEntryByRemoteIdUseCase: GetLedgerEntryByRemoteIdUseCase;
  addLedgerEntryUseCase: AddLedgerEntryUseCase;
  updateLedgerEntryUseCase: UpdateLedgerEntryUseCase;
  addTransactionUseCase: AddTransactionUseCase;
  updateTransactionUseCase: UpdateTransactionUseCase;
  deleteTransactionUseCase: DeleteTransactionUseCase;
  onSaved: () => void;
};

const entryTypeOptions: readonly LedgerEntryTypeOptionState[] = [
  { value: LedgerEntryType.Sale, label: "Sale Due" },
  { value: LedgerEntryType.Purchase, label: "Purchase Due" },
  { value: LedgerEntryType.Collection, label: "Receive Money" },
  { value: LedgerEntryType.PaymentOut, label: "Pay Money" },
] as const;

const paymentModeOptions: readonly LedgerPaymentModeOptionState[] = [
  { value: LedgerPaymentMode.Cash, label: "Cash" },
  { value: LedgerPaymentMode.BankTransfer, label: "Bank Transfer" },
  { value: LedgerPaymentMode.MobileWallet, label: "Mobile Wallet" },
  { value: LedgerPaymentMode.Card, label: "Card" },
  { value: LedgerPaymentMode.Cheque, label: "Cheque" },
  { value: LedgerPaymentMode.Other, label: "Other" },
] as const;

const normalizePartyName = (value: string): string => value.trim().toLowerCase();

const buildAutoTitle = (entryType: LedgerEntryTypeValue, partyName: string): string => {
  const actionLabel = getLedgerEntryTypeLabel(entryType);
  if (!partyName.trim()) {
    return actionLabel;
  }

  return `${actionLabel} - ${partyName.trim()}`;
};

const clearFieldError = (
  fieldErrors: LedgerEditorFieldErrors,
  field: keyof LedgerEditorFieldErrors,
): LedgerEditorFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

const buildSettlementTransactionPayload = ({
  remoteId,
  ownerUserRemoteId,
  businessAccountRemoteId,
  businessAccountDisplayName,
  entryType,
  partyName,
  amount,
  currencyCode,
  note,
  happenedAt,
}: {
  remoteId: string;
  ownerUserRemoteId: string;
  businessAccountRemoteId: string;
  businessAccountDisplayName: string;
  entryType: LedgerEntryTypeValue;
  partyName: string;
  amount: number;
  currencyCode: string | null;
  note: string | null;
  happenedAt: number;
}): SaveTransactionPayload => {
  const isReceive = entryType === LedgerEntryType.Collection;

  return {
    remoteId,
    ownerUserRemoteId,
    accountRemoteId: businessAccountRemoteId,
    accountDisplayNameSnapshot: businessAccountDisplayName,
    transactionType: isReceive ? TransactionType.Income : TransactionType.Expense,
    direction: isReceive ? TransactionDirection.In : TransactionDirection.Out,
    title: `${isReceive ? "Received from" : "Paid to"} ${partyName}`,
    amount,
    currencyCode,
    categoryLabel: "Ledger",
    note,
    happenedAt,
  };
};

const isLikelyDuplicate = ({
  entries,
  editingRemoteId,
  entryType,
  partyName,
  amount,
  happenedAtInput,
}: {
  entries: readonly LedgerEntry[];
  editingRemoteId: string | null;
  entryType: LedgerEntryTypeValue;
  partyName: string;
  amount: number;
  happenedAtInput: string;
}): boolean => {
  const normalizedPartyName = normalizePartyName(partyName);
  const normalizedDate = happenedAtInput.trim();

  return entries.some((entry) => {
    if (editingRemoteId && entry.remoteId === editingRemoteId) {
      return false;
    }

    return (
      entry.entryType === entryType &&
      normalizePartyName(entry.partyName) === normalizedPartyName &&
      Math.abs(entry.amount - amount) < 0.0001 &&
      formatDateInput(entry.happenedAt) === normalizedDate
    );
  });
};

export const useLedgerEditorViewModel = ({
  ownerUserRemoteId,
  activeBusinessAccountRemoteId,
  activeBusinessAccountDisplayName,
  activeBusinessCurrencyCode,
  getLedgerEntriesUseCase,
  getLedgerEntryByRemoteIdUseCase,
  addLedgerEntryUseCase,
  updateLedgerEntryUseCase,
  addTransactionUseCase,
  updateTransactionUseCase,
  deleteTransactionUseCase,
  onSaved,
}: UseLedgerEditorViewModelParams): LedgerEditorViewModel => {
  const [state, setState] =
    useState<LedgerEditorFormState>(DEFAULT_LEDGER_STATE);
  const [knownParties, setKnownParties] = useState<readonly string[]>([]);

  const loadKnownParties = useCallback(async () => {
    if (!activeBusinessAccountRemoteId) {
      setKnownParties([]);
      return;
    }

    const result = await getLedgerEntriesUseCase.execute({
      businessAccountRemoteId: activeBusinessAccountRemoteId,
    });

    if (!result.success) {
      return;
    }

    const deduped = new Set<string>();
    result.value.forEach((entry) => {
      const name = entry.partyName.trim();
      if (name.length > 0) {
        deduped.add(name);
      }
    });

    setKnownParties(Array.from(deduped.values()).sort((a, b) => a.localeCompare(b)));
  }, [activeBusinessAccountRemoteId, getLedgerEntriesUseCase]);

  const partySuggestions = useMemo(() => {
    const query = state.partyName.trim().toLowerCase();
    if (query.length === 0) {
      return [] as string[];
    }

    return knownParties
      .filter((partyName) => {
        const normalized = partyName.toLowerCase();
        return normalized.includes(query) && normalized !== query;
      })
      .slice(0, 6);
  }, [knownParties, state.partyName]);

  const buildCreateState = useCallback(
    (entryType: LedgerEntryTypeValue, partyName = ""): LedgerEditorFormState => {
      const shouldAskPaymentMode = requiresPaymentMode(entryType);

      return {
        ...DEFAULT_LEDGER_STATE,
        visible: true,
        mode: "create",
        entryType,
        partyName,
        happenedAt: formatDateInput(Date.now()),
        paymentMode: shouldAskPaymentMode ? LedgerPaymentMode.Cash : "",
      };
    },
    [],
  );

  const openCreate = useCallback(
    (entryType: LedgerEntryTypeValue) => {
      setState(buildCreateState(entryType));
      void loadKnownParties();
    },
    [buildCreateState, loadKnownParties],
  );

  const openCreateForParty = useCallback(
    (partyName: string, entryType: LedgerEntryTypeValue) => {
      setState(buildCreateState(entryType, partyName));
      void loadKnownParties();
    },
    [buildCreateState, loadKnownParties],
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
        return;
      }

      const showMoreDetails =
        (result.value.referenceNumber ?? "").trim().length > 0 ||
        (result.value.note ?? "").trim().length > 0 ||
        result.value.reminderAt !== null ||
        (result.value.attachmentUri ?? "").trim().length > 0;

      setState({
        visible: true,
        mode: "edit",
        editingRemoteId: result.value.remoteId,
        entryType: result.value.entryType,
        partyName: result.value.partyName,
        amount: String(result.value.amount),
        happenedAt: formatDateInput(result.value.happenedAt),
        dueAt: formatDateInput(result.value.dueAt),
        paymentMode:
          result.value.paymentMode ??
          (requiresPaymentMode(result.value.entryType)
            ? LedgerPaymentMode.Cash
            : ""),
        referenceNumber: result.value.referenceNumber ?? "",
        note: result.value.note ?? "",
        reminderAt: formatDateInput(result.value.reminderAt),
        attachmentUri: result.value.attachmentUri ?? "",
        linkedTransactionRemoteId: result.value.linkedTransactionRemoteId,
        showMoreDetails,
        fieldErrors: {},
        isSaving: false,
        errorMessage: null,
      });

      void loadKnownParties();
    },
    [getLedgerEntryByRemoteIdUseCase, loadKnownParties],
  );

  const close = useCallback(() => {
    setState(DEFAULT_LEDGER_STATE);
  }, []);

  const handleChangeEntryType = useCallback(
    (entryType: LedgerEntryTypeValue) => {
      setState((currentState) => {
        const shouldAskPaymentMode = requiresPaymentMode(entryType);

        return {
          ...currentState,
          entryType,
          dueAt: requiresDueDate(entryType) ? currentState.dueAt : "",
          paymentMode: shouldAskPaymentMode
            ? currentState.paymentMode || LedgerPaymentMode.Cash
            : "",
          fieldErrors: {
            ...currentState.fieldErrors,
            dueAt: undefined,
            paymentMode: undefined,
          },
          errorMessage: null,
        };
      });
    },
    [],
  );

  const handlePickAttachment = useCallback(async () => {
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
  }, []);

  const handleSubmit = useCallback(async () => {
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

    if (!requiresDueDate(state.entryType) && state.dueAt.trim().length > 0 && dueAt === null) {
      nextFieldErrors.dueAt = "Enter a valid due date in YYYY-MM-DD format.";
    }

    if (requiresPaymentMode(state.entryType) && !state.paymentMode) {
      nextFieldErrors.paymentMode = "Payment mode is required for this action.";
    }

    if (state.reminderAt.trim().length > 0 && reminderAt === null) {
      nextFieldErrors.reminderAt = "Enter a valid reminder date in YYYY-MM-DD format.";
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

    if (
      isLikelyDuplicate({
        entries: duplicateCheckResult.value,
        editingRemoteId: state.mode === "edit" ? state.editingRemoteId : null,
        entryType: state.entryType,
        partyName: normalizedPartyName,
        amount,
        happenedAtInput: state.happenedAt,
      })
    ) {
      setState((currentState) => ({
        ...currentState,
        fieldErrors: {
          ...currentState.fieldErrors,
          partyName: "A similar entry already exists for this party/date/amount.",
        },
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

    const resolvedDueAt =
      requiresDueDate(state.entryType)
        ? (dueAt as number)
        : state.dueAt.trim().length === 0
          ? null
          : dueAt;
    const resolvedHappenedAt = happenedAt as number;
    const resolvedPaymentMode = requiresPaymentMode(state.entryType)
      ? (state.paymentMode as LedgerPaymentModeValue)
      : null;
    const resolvedReminderAt = state.reminderAt.trim().length === 0 ? null : reminderAt;

    const resolvedCurrencyCode = resolveCurrencyCode({
      currencyCode: activeBusinessCurrencyCode,
    });

    const transactionNote = state.note.trim() || null;
    const shouldSyncTransaction = requiresPaymentMode(state.entryType);
    let linkedTransactionRemoteId = state.linkedTransactionRemoteId;
    let createdTransactionRemoteId: string | null = null;
    let transactionToDeleteAfterSave: string | null = null;

    if (shouldSyncTransaction) {
      const transactionRemoteId = linkedTransactionRemoteId ?? createTransactionRemoteId();
      const transactionPayload = buildSettlementTransactionPayload({
        remoteId: transactionRemoteId,
        ownerUserRemoteId,
        businessAccountRemoteId,
        businessAccountDisplayName: activeBusinessAccountDisplayName,
        entryType: state.entryType,
        partyName: normalizedPartyName,
        amount,
        currencyCode: resolvedCurrencyCode,
        note: transactionNote,
        happenedAt: resolvedHappenedAt,
      });

      const transactionResult = linkedTransactionRemoteId
        ? await updateTransactionUseCase.execute(transactionPayload)
        : await addTransactionUseCase.execute(transactionPayload);

      if (!transactionResult.success) {
        setState((currentState) => ({
          ...currentState,
          isSaving: false,
          fieldErrors: {},
          errorMessage: transactionResult.error.message,
        }));
        return;
      }

      if (!linkedTransactionRemoteId) {
        linkedTransactionRemoteId = transactionRemoteId;
        createdTransactionRemoteId = transactionRemoteId;
      }
    } else if (linkedTransactionRemoteId) {
      transactionToDeleteAfterSave = linkedTransactionRemoteId;
      linkedTransactionRemoteId = null;
    }

    const payload: SaveLedgerEntryPayload = {
      remoteId:
        state.mode === "create"
          ? createLedgerRemoteId()
          : (state.editingRemoteId ?? ""),
      businessAccountRemoteId,
      ownerUserRemoteId,
      partyName: normalizedPartyName,
      partyPhone: null,
      entryType: state.entryType,
      balanceDirection: resolveDefaultDirectionForEntryType(state.entryType),
      title: buildAutoTitle(state.entryType, normalizedPartyName),
      amount,
      currencyCode: resolvedCurrencyCode,
      note: transactionNote,
      happenedAt: resolvedHappenedAt,
      dueAt: resolvedDueAt,
      paymentMode: resolvedPaymentMode,
      referenceNumber: state.referenceNumber.trim() || null,
      reminderAt: resolvedReminderAt,
      attachmentUri: state.attachmentUri.trim() || null,
      linkedTransactionRemoteId,
      settlementAccountRemoteId: null,
      settlementAccountDisplayNameSnapshot: null,
    };

    const result =
      state.mode === "create"
        ? await addLedgerEntryUseCase.execute(payload)
        : await updateLedgerEntryUseCase.execute(payload);

    if (!result.success) {
      if (createdTransactionRemoteId) {
        await deleteTransactionUseCase.execute(createdTransactionRemoteId);
      }

      setState((currentState) => ({
        ...currentState,
        isSaving: false,
        fieldErrors: {},
        errorMessage: result.error.message,
      }));
      return;
    }

    if (transactionToDeleteAfterSave) {
      await deleteTransactionUseCase.execute(transactionToDeleteAfterSave);
    }

    close();
    onSaved();
  }, [
    activeBusinessAccountDisplayName,
    activeBusinessAccountRemoteId,
    activeBusinessCurrencyCode,
    addLedgerEntryUseCase,
    addTransactionUseCase,
    close,
    deleteTransactionUseCase,
    getLedgerEntriesUseCase,
    onSaved,
    ownerUserRemoteId,
    state.amount,
    state.attachmentUri,
    state.dueAt,
    state.editingRemoteId,
    state.entryType,
    state.happenedAt,
    state.linkedTransactionRemoteId,
    state.mode,
    state.note,
    state.partyName,
    state.paymentMode,
    state.referenceNumber,
    state.reminderAt,
    updateLedgerEntryUseCase,
    updateTransactionUseCase,
  ]);

  return useMemo(
    () => ({
      state,
      partySuggestions,
      availableEntryTypes: entryTypeOptions,
      availablePaymentModes: paymentModeOptions,
      openCreate,
      openCreateForParty,
      openEdit,
      close,
      onChangeEntryType: handleChangeEntryType,
      onSelectPartySuggestion: (partyName: string) =>
        setState((currentState) => ({
          ...currentState,
          partyName,
          fieldErrors: {
            ...currentState.fieldErrors,
            partyName: undefined,
          },
          errorMessage: null,
        })),
      onChangePartyName: (partyName: string) =>
        setState((currentState) => ({
          ...currentState,
          partyName,
          fieldErrors: {
            ...currentState.fieldErrors,
            partyName: undefined,
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
      onChangePaymentMode: (paymentMode: LedgerPaymentModeValue | "") =>
        setState((currentState) => ({
          ...currentState,
          paymentMode,
          fieldErrors: {
            ...currentState.fieldErrors,
            paymentMode: undefined,
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
      pickAttachment: handlePickAttachment,
      clearAttachment: () =>
        setState((currentState) => ({
          ...currentState,
          attachmentUri: "",
          errorMessage: null,
        })),
      submit: handleSubmit,
    }),
    [
      close,
      handleChangeEntryType,
      handlePickAttachment,
      handleSubmit,
      openCreate,
      openCreateForParty,
      openEdit,
      partySuggestions,
      state,
    ],
  );
};
