import {
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
  showMoreDetails: false,
  fieldErrors: {},
  isSaving: false,
  errorMessage: null,
};

const createLedgerRemoteId = (): string => {
  return `led-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

type UseLedgerEditorViewModelParams = {
  ownerUserRemoteId: string;
  activeBusinessAccountRemoteId: string | null;
  activeBusinessCurrencyCode: string | null;
  getLedgerEntryByRemoteIdUseCase: GetLedgerEntryByRemoteIdUseCase;
  addLedgerEntryUseCase: AddLedgerEntryUseCase;
  updateLedgerEntryUseCase: UpdateLedgerEntryUseCase;
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

export const useLedgerEditorViewModel = ({
  ownerUserRemoteId,
  activeBusinessAccountRemoteId,
  activeBusinessCurrencyCode,
  getLedgerEntryByRemoteIdUseCase,
  addLedgerEntryUseCase,
  updateLedgerEntryUseCase,
  onSaved,
}: UseLedgerEditorViewModelParams): LedgerEditorViewModel => {
  const [state, setState] =
    useState<LedgerEditorFormState>(DEFAULT_LEDGER_STATE);

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
    },
    [buildCreateState],
  );

  const openCreateForParty = useCallback(
    (partyName: string, entryType: LedgerEntryTypeValue) => {
      setState(buildCreateState(entryType, partyName));
    },
    [buildCreateState],
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
        showMoreDetails,
        fieldErrors: {},
        isSaving: false,
        errorMessage: null,
      });
    },
    [getLedgerEntryByRemoteIdUseCase],
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
      currencyCode: resolveCurrencyCode({
        currencyCode: activeBusinessCurrencyCode,
      }),
      note: state.note.trim() || null,
      happenedAt: resolvedHappenedAt,
      dueAt: resolvedDueAt,
      paymentMode: resolvedPaymentMode,
      referenceNumber: state.referenceNumber.trim() || null,
      reminderAt: resolvedReminderAt,
      attachmentUri: state.attachmentUri.trim() || null,
      settlementAccountRemoteId: null,
      settlementAccountDisplayNameSnapshot: null,
    };

    const result =
      state.mode === "create"
        ? await addLedgerEntryUseCase.execute(payload)
        : await updateLedgerEntryUseCase.execute(payload);

    if (!result.success) {
      setState((currentState) => ({
        ...currentState,
        isSaving: false,
        fieldErrors: {},
        errorMessage: result.error.message,
      }));
      return;
    }

    close();
    onSaved();
  }, [
    activeBusinessAccountRemoteId,
    activeBusinessCurrencyCode,
    addLedgerEntryUseCase,
    close,
    onSaved,
    ownerUserRemoteId,
    state.amount,
    state.attachmentUri,
    state.dueAt,
    state.editingRemoteId,
    state.entryType,
    state.happenedAt,
    state.mode,
    state.note,
    state.partyName,
    state.paymentMode,
    state.referenceNumber,
    state.reminderAt,
    updateLedgerEntryUseCase,
  ]);

  return useMemo(
    () => ({
      state,
      availableEntryTypes: entryTypeOptions,
      availablePaymentModes: paymentModeOptions,
      openCreate,
      openCreateForParty,
      openEdit,
      close,
      onChangeEntryType: handleChangeEntryType,
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
      state,
    ],
  );
};
