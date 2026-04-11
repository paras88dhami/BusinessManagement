import {
  MoneyAccount,
  MoneyAccountType,
} from "@/feature/accounts/types/moneyAccount.types";
import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { ContactType } from "@/feature/contacts/types/contact.types";
import { GetOrCreateBusinessContactUseCase } from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase";
import {
  LedgerEntry,
  LedgerEntryType,
  LedgerEntryTypeValue,
  SaveLedgerEntryPayload,
} from "@/feature/ledger/types/ledger.entity.types";
import {
  LedgerAccountOptionState,
  LedgerEditorFieldErrors,
  LedgerEditorFormState,
  LedgerEntryTypeOptionState,
  LedgerSettlementLinkOptionState,
} from "@/feature/ledger/types/ledger.state.types";
import { BuildSettlementLinkCandidatesUseCase } from "@/feature/ledger/useCase/buildSettlementLinkCandidates.useCase";
import { CheckDuplicateLedgerEntryUseCase } from "@/feature/ledger/useCase/checkDuplicateLedgerEntry.useCase";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { GetLedgerEntryByRemoteIdUseCase } from "@/feature/ledger/useCase/getLedgerEntryByRemoteId.useCase";
import {
  INVALID_LEDGER_SETTLEMENT_ACCOUNT_MESSAGE,
  SaveLedgerEntryWithSettlementUseCase,
} from "@/feature/ledger/useCase/saveLedgerEntryWithSettlement.useCase";
import { resolveCurrencyCode } from "@/shared/utils/currency/accountCurrency";
import { pickImageFromLibrary } from "@/shared/utils/media/pickImage";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatDateInput,
  getLedgerEntryTypeLabel,
  parseDateInput,
  requiresDueDate,
  requiresPaymentMode,
  resolveDefaultDirectionForEntryType,
} from "./ledger.shared";
import { LedgerEditorViewModel } from "./ledgerEditor.viewModel";

type LedgerEditorInternalState = LedgerEditorFormState & {
  editingRemoteId: string | null;
  linkedDocumentRemoteId: string | null;
  linkedTransactionRemoteId: string | null;
};

const DEFAULT_LEDGER_STATE: LedgerEditorInternalState = {
  visible: false,
  mode: "create",
  editingRemoteId: null,
  entryType: LedgerEntryType.Sale,
  partyName: "",
  amount: "",
  happenedAt: formatDateInput(Date.now()),
  dueAt: "",
  settlementAccountRemoteId: "",
  referenceNumber: "",
  note: "",
  reminderAt: "",
  attachmentUri: "",
  settledAgainstEntryRemoteId: "",
  linkedDocumentRemoteId: null,
  linkedTransactionRemoteId: null,
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

const entryTypeOptions: readonly LedgerEntryTypeOptionState[] = [
  { value: LedgerEntryType.Sale, label: "Sale Due" },
  { value: LedgerEntryType.Purchase, label: "Purchase Due" },
  { value: LedgerEntryType.Collection, label: "Receive Money" },
  { value: LedgerEntryType.PaymentOut, label: "Pay Money" },
] as const;

const resolveContactTypeForEntryType = (
  entryType: LedgerEntryTypeValue,
): (typeof ContactType)[keyof typeof ContactType] => {
  if (
    entryType === LedgerEntryType.Sale ||
    entryType === LedgerEntryType.Collection
  ) {
    return ContactType.Customer;
  }

  if (
    entryType === LedgerEntryType.Purchase ||
    entryType === LedgerEntryType.PaymentOut
  ) {
    return ContactType.Supplier;
  }

  return ContactType.Other;
};

const mapMoneyAccountToSettlementOption = (
  moneyAccount: MoneyAccount,
): LedgerAccountOptionState => {
  const accountTypeLabel =
    moneyAccount.type === MoneyAccountType.Cash
      ? "Cash"
      : moneyAccount.type === MoneyAccountType.Bank
        ? "Bank"
        : "Wallet";
  const primaryTag = moneyAccount.isPrimary ? " (Primary)" : "";

  return {
    remoteId: moneyAccount.remoteId,
    label: `${moneyAccount.name} | ${accountTypeLabel}${primaryTag}`,
    currencyCode: moneyAccount.currencyCode,
  };
};

const buildAutoTitle = (
  entryType: LedgerEntryTypeValue,
  partyName: string,
): string => {
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
  const [state, setState] =
    useState<LedgerEditorInternalState>(DEFAULT_LEDGER_STATE);
  const [knownParties, setKnownParties] = useState<readonly string[]>([]);
  const [knownLedgerEntries, setKnownLedgerEntries] = useState<
    readonly LedgerEntry[]
  >([]);
  const [availableSettlementAccounts, setAvailableSettlementAccounts] =
    useState<readonly LedgerAccountOptionState[]>([]);
  const [knownMoneyAccounts, setKnownMoneyAccounts] = useState<
    readonly MoneyAccount[]
  >([]);

  const loadMoneyAccounts = useCallback(async () => {
    if (!activeBusinessAccountRemoteId) {
      setAvailableSettlementAccounts([]);
      setKnownMoneyAccounts([]);
      return;
    }

    const moneyAccountsResult = await getMoneyAccountsUseCase.execute(
      activeBusinessAccountRemoteId,
    );
    if (!moneyAccountsResult.success) {
      setAvailableSettlementAccounts([]);
      setKnownMoneyAccounts([]);
      return;
    }

    const activeMoneyAccounts = moneyAccountsResult.value.filter(
      (moneyAccount) => moneyAccount.isActive,
    );
    const sortedActiveMoneyAccounts = [...activeMoneyAccounts].sort(
      (left, right) => {
        if (left.isPrimary && !right.isPrimary) return -1;
        if (!left.isPrimary && right.isPrimary) return 1;
        return left.name.localeCompare(right.name);
      },
    );

    setKnownMoneyAccounts(sortedActiveMoneyAccounts);
    setAvailableSettlementAccounts(
      sortedActiveMoneyAccounts.map(mapMoneyAccountToSettlementOption),
    );

    const defaultSettlementAccountRemoteId =
      sortedActiveMoneyAccounts[0]?.remoteId ?? "";
    setState((currentState) => {
      if (!requiresPaymentMode(currentState.entryType)) {
        return currentState;
      }

      if (currentState.settlementAccountRemoteId.trim().length > 0) {
        return currentState;
      }

      return {
        ...currentState,
        settlementAccountRemoteId: defaultSettlementAccountRemoteId,
      };
    });
  }, [activeBusinessAccountRemoteId, getMoneyAccountsUseCase]);

  const loadKnownParties = useCallback(async () => {
    if (!activeBusinessAccountRemoteId) {
      setKnownParties([]);
      setKnownLedgerEntries([]);
      return;
    }

    const result = await getLedgerEntriesUseCase.execute({
      businessAccountRemoteId: activeBusinessAccountRemoteId,
    });

    if (!result.success) {
      setKnownLedgerEntries([]);
      return;
    }

    const deduped = new Set<string>();
    result.value.forEach((entry) => {
      const name = entry.partyName.trim();
      if (name.length > 0) {
        deduped.add(name);
      }
    });

    setKnownParties(
      Array.from(deduped.values()).sort((a, b) => a.localeCompare(b)),
    );
    setKnownLedgerEntries(result.value);
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

  const [settlementLinkOptions, setSettlementLinkOptions] = useState<
    readonly LedgerSettlementLinkOptionState[]
  >([]);

  const loadSettlementLinkOptions = useCallback(async () => {
    const baseOptions = (
      await buildSettlementLinkCandidatesUseCase.execute({
        entries: knownLedgerEntries,
        settlementEntryType: state.entryType,
        partyName: state.partyName,
        fallbackCurrencyCode: activeBusinessCurrencyCode,
      })
    ).map((candidate) => ({
      value: candidate.remoteId,
      label: candidate.label,
    }));

    const selectedRemoteId = state.settledAgainstEntryRemoteId.trim();
    if (!selectedRemoteId) {
      setSettlementLinkOptions(baseOptions);
      return;
    }

    const selectedStillPresent = baseOptions.some(
      (option) => option.value === selectedRemoteId,
    );
    if (selectedStillPresent) {
      setSettlementLinkOptions(baseOptions);
      return;
    }

    setSettlementLinkOptions([
      {
        value: selectedRemoteId,
        label: "Previously linked due (settled/closed)",
      },
      ...baseOptions,
    ]);
  }, [
    activeBusinessCurrencyCode,
    buildSettlementLinkCandidatesUseCase,
    knownLedgerEntries,
    state.entryType,
    state.partyName,
    state.settledAgainstEntryRemoteId,
  ]);

  useEffect(() => {
    void loadSettlementLinkOptions();
  }, [loadSettlementLinkOptions]);

  const resolveDefaultSettlementAccountRemoteId = useCallback((): string => {
    if (knownMoneyAccounts.length === 0) {
      return "";
    }

    return knownMoneyAccounts[0].remoteId;
  }, [knownMoneyAccounts]);

  const buildCreateState = useCallback(
    (
      entryType: LedgerEntryTypeValue,
      partyName = "",
    ): LedgerEditorInternalState => {
      return {
        ...DEFAULT_LEDGER_STATE,
        visible: true,
        mode: "create",
        entryType,
        partyName,
        happenedAt: formatDateInput(Date.now()),
        settlementAccountRemoteId: requiresPaymentMode(entryType)
          ? resolveDefaultSettlementAccountRemoteId()
          : "",
      };
    },
    [resolveDefaultSettlementAccountRemoteId],
  );

  const openCreate = useCallback(
    (entryType: LedgerEntryTypeValue) => {
      setState(buildCreateState(entryType));
      void loadKnownParties();
      void loadMoneyAccounts();
    },
    [buildCreateState, loadKnownParties, loadMoneyAccounts],
  );

  const openCreateForParty = useCallback(
    (partyName: string, entryType: LedgerEntryTypeValue) => {
      setState(buildCreateState(entryType, partyName));
      void loadKnownParties();
      void loadMoneyAccounts();
    },
    [buildCreateState, loadKnownParties, loadMoneyAccounts],
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
        (result.value.attachmentUri ?? "").trim().length > 0 ||
        (result.value.settledAgainstEntryRemoteId ?? "").trim().length > 0;

      setState({
        visible: true,
        mode: "edit",
        editingRemoteId: result.value.remoteId,
        entryType: result.value.entryType,
        partyName: result.value.partyName,
        amount: String(result.value.amount),
        happenedAt: formatDateInput(result.value.happenedAt),
        dueAt: formatDateInput(result.value.dueAt),
        settlementAccountRemoteId: requiresPaymentMode(result.value.entryType)
          ? (result.value.settlementAccountRemoteId ?? "")
          : "",
        referenceNumber: result.value.referenceNumber ?? "",
        note: result.value.note ?? "",
        reminderAt: formatDateInput(result.value.reminderAt),
        attachmentUri: result.value.attachmentUri ?? "",
        settledAgainstEntryRemoteId:
          result.value.settledAgainstEntryRemoteId ?? "",
        linkedDocumentRemoteId: result.value.linkedDocumentRemoteId,
        linkedTransactionRemoteId: result.value.linkedTransactionRemoteId,
        showMoreDetails,
        fieldErrors: {},
        isSaving: false,
        errorMessage: null,
      });

      void loadKnownParties();
      void loadMoneyAccounts();
    },
    [getLedgerEntryByRemoteIdUseCase, loadKnownParties, loadMoneyAccounts],
  );

  const close = useCallback(() => {
    setState(DEFAULT_LEDGER_STATE);
  }, []);

  const handleChangeEntryType = useCallback(
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
    [resolveDefaultSettlementAccountRemoteId],
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

  const viewState = useMemo<LedgerEditorFormState>(
    () => ({
      visible: state.visible,
      mode: state.mode,
      entryType: state.entryType,
      partyName: state.partyName,
      amount: state.amount,
      happenedAt: state.happenedAt,
      dueAt: state.dueAt,
      settlementAccountRemoteId: state.settlementAccountRemoteId,
      referenceNumber: state.referenceNumber,
      note: state.note,
      reminderAt: state.reminderAt,
      attachmentUri: state.attachmentUri,
      settledAgainstEntryRemoteId: state.settledAgainstEntryRemoteId,
      showMoreDetails: state.showMoreDetails,
      fieldErrors: state.fieldErrors,
      isSaving: state.isSaving,
      errorMessage: state.errorMessage,
    }),
    [state],
  );

  return useMemo(
    () => ({
      state: viewState,
      partySuggestions,
      availableEntryTypes: entryTypeOptions,
      availableSettlementAccounts,
      settlementLinkOptions,
      openCreate,
      openCreateForParty,
      openEdit,
      close,
      onChangeEntryType: handleChangeEntryType,
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
      onChangeSettledAgainstEntryRemoteId: (
        settledAgainstEntryRemoteId: string,
      ) =>
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
      availableSettlementAccounts,
      partySuggestions,
      settlementLinkOptions,
      viewState,
    ],
  );
};
