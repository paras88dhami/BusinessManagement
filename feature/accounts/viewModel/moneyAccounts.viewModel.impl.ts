import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MoneyAccount,
  MoneyAccountType,
} from "@/feature/accounts/types/moneyAccount.types";
import { validateMoneyAccountForm } from "@/feature/accounts/validation/validateMoneyAccountForm";
import { validateMoneyAccountAdjustmentForm } from "@/feature/accounts/validation/validateMoneyAccountAdjustmentForm";
import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { SaveMoneyAccountUseCase } from "@/feature/accounts/useCase/saveMoneyAccount.useCase";
import { ArchiveMoneyAccountUseCase } from "@/feature/accounts/useCase/archiveMoneyAccount.useCase";
import { AdjustMoneyAccountBalanceUseCase } from "@/feature/accounts/useCase/adjustMoneyAccountBalance.useCase";
import {
  MoneyAccountAdjustmentFieldErrors,
  MoneyAccountAdjustmentFormState,
  MoneyAccountFormFieldErrors,
  MoneyAccountFormState,
  MoneyAccountsViewModel,
} from "./moneyAccounts.viewModel";
import {
  formatCurrencyAmount,
  resolveCurrencyCode,
} from "@/shared/utils/currency/accountCurrency";

const createEmptyForm = (): MoneyAccountFormState => ({
  remoteId: null,
  name: "",
  type: MoneyAccountType.Cash,
  balance: "0",
  description: "",
  fieldErrors: {},
});

const createEmptyAdjustmentForm = (): MoneyAccountAdjustmentFormState => ({
  moneyAccountRemoteId: null,
  accountName: "",
  currentBalanceLabel: "",
  targetBalance: "",
  reason: "",
  fieldErrors: {},
  errorMessage: null,
  isSaving: false,
});

const mapMoneyAccountToForm = (
  moneyAccount: MoneyAccount,
): MoneyAccountFormState => ({
  remoteId: moneyAccount.remoteId,
  name: moneyAccount.name,
  type: moneyAccount.type,
  balance: String(moneyAccount.currentBalance),
  description: moneyAccount.description ?? "",
  fieldErrors: {},
});

const parseBalance = (value: string): number | null => {
  const normalizedValue = value.trim().replace(/,/g, "");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const sortAccounts = (accounts: readonly MoneyAccount[]): MoneyAccount[] => {
  return [...accounts].sort((leftAccount, rightAccount) => {
    if (leftAccount.isPrimary && !rightAccount.isPrimary) {
      return -1;
    }

    if (!leftAccount.isPrimary && rightAccount.isPrimary) {
      return 1;
    }

    return rightAccount.updatedAt - leftAccount.updatedAt;
  });
};

const clearFormFieldError = (
  fieldErrors: MoneyAccountFormFieldErrors,
  field: keyof MoneyAccountFormFieldErrors,
): MoneyAccountFormFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

const clearAdjustmentFieldError = (
  fieldErrors: MoneyAccountAdjustmentFieldErrors,
  field: keyof MoneyAccountAdjustmentFieldErrors,
): MoneyAccountAdjustmentFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

type UseMoneyAccountsViewModelParams = {
  activeUserRemoteId: string | null;
  scopeAccountRemoteId: string | null;
  scopeAccountDisplayName: string;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  canManage: boolean;
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase;
  saveMoneyAccountUseCase: SaveMoneyAccountUseCase;
  archiveMoneyAccountUseCase: ArchiveMoneyAccountUseCase;
  adjustMoneyAccountBalanceUseCase: AdjustMoneyAccountBalanceUseCase;
  onOpenAccountHistory: (
    moneyAccountRemoteId: string,
    moneyAccountName: string,
  ) => void;
};

export const useMoneyAccountsViewModel = ({
  activeUserRemoteId,
  scopeAccountRemoteId,
  scopeAccountDisplayName,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  canManage,
  getMoneyAccountsUseCase,
  saveMoneyAccountUseCase,
  archiveMoneyAccountUseCase,
  adjustMoneyAccountBalanceUseCase,
  onOpenAccountHistory,
}: UseMoneyAccountsViewModelParams): MoneyAccountsViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<MoneyAccount[]>([]);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<MoneyAccountFormState>(createEmptyForm());
  const [adjustmentForm, setAdjustmentForm] =
    useState<MoneyAccountAdjustmentFormState>(createEmptyAdjustmentForm());
  const [isAdjustmentModalVisible, setIsAdjustmentModalVisible] = useState(false);
  const [pendingDeleteRemoteId, setPendingDeleteRemoteId] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMoneyAccounts = useCallback(async () => {
    if (!scopeAccountRemoteId) {
      setAccounts([]);
      setErrorMessage("An active account context is required to manage accounts.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await getMoneyAccountsUseCase.execute(scopeAccountRemoteId);

    if (!result.success) {
      setAccounts([]);
      setErrorMessage(result.error.message);
      setIsLoading(false);
      return;
    }

    setAccounts(sortAccounts(result.value));
    setErrorMessage(null);
    setIsLoading(false);
  }, [getMoneyAccountsUseCase, scopeAccountRemoteId]);

  useEffect(() => {
    void loadMoneyAccounts();
  }, [loadMoneyAccounts]);

  const onOpenCreate = useCallback(() => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage money accounts.");
      return;
    }

    setEditorMode("create");
    setForm(createEmptyForm());
    setErrorMessage(null);
    setDeleteErrorMessage(null);
    setIsEditorVisible(true);
  }, [canManage]);

  const onOpenEdit = useCallback(
    (account: MoneyAccount) => {
      if (!canManage) {
        setErrorMessage("You do not have permission to manage money accounts.");
        return;
      }

      setEditorMode("edit");
      setForm(mapMoneyAccountToForm(account));
      setErrorMessage(null);
      setDeleteErrorMessage(null);
      setIsEditorVisible(true);
    },
    [canManage],
  );

  const onCloseEditor = useCallback(() => {
    setIsEditorVisible(false);
    setForm(createEmptyForm());
    setErrorMessage(null);
    setDeleteErrorMessage(null);
  }, []);

  const onFormChange = useCallback(
    (field: keyof Omit<MoneyAccountFormState, "fieldErrors">, value: string) => {
      setErrorMessage(null);

      setForm((current) => {
        if (field === "balance" && editorMode === "edit") {
          return current;
        }

        let nextFieldErrors = current.fieldErrors;

        if (field === "name") {
          nextFieldErrors = clearFormFieldError(current.fieldErrors, "name");
        } else if (field === "balance") {
          nextFieldErrors = clearFormFieldError(current.fieldErrors, "balance");
        }

        return {
          ...current,
          [field]: value,
          fieldErrors: nextFieldErrors,
        };
      });
    },
    [editorMode],
  );

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  }, [accounts]);

  const currencyCode = useMemo(
    () =>
      resolveCurrencyCode({
        currencyCode: activeAccountCurrencyCode,
        countryCode: activeAccountCountryCode,
      }),
    [activeAccountCountryCode, activeAccountCurrencyCode],
  );

  const onSubmit = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage money accounts.");
      return;
    }

    if (!activeUserRemoteId) {
      setErrorMessage("An active user session is required to save accounts.");
      return;
    }

    if (!scopeAccountRemoteId) {
      setErrorMessage("An active account context is required to save accounts.");
      return;
    }

    const nextFieldErrors = validateMoneyAccountForm({
      mode: editorMode,
      name: form.name,
      balance: form.balance,
    });

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setForm((current) => ({
        ...current,
        fieldErrors: nextFieldErrors,
      }));
      setErrorMessage(null);
      return;
    }

    const remoteIdForSave = form.remoteId ?? Crypto.randomUUID();
    const isFirstScopeAccount = accounts.length === 0;
    const existingRecord = form.remoteId
      ? accounts.find((account) => account.remoteId === form.remoteId)
      : null;

    if (editorMode === "edit") {
      if (!form.remoteId) {
        setErrorMessage("Money account id is required.");
        return;
      }

      if (!existingRecord) {
        setErrorMessage("Money account not found.");
        return;
      }
    }

    const parsedOpeningBalance = parseBalance(form.balance);
    const balanceForSave =
      editorMode === "edit"
        ? existingRecord!.currentBalance
        : parsedOpeningBalance;

    if (balanceForSave === null) {
      setForm((current) => ({
        ...current,
        fieldErrors: {
          ...current.fieldErrors,
          balance: "Opening balance is required.",
        },
      }));
      setErrorMessage(null);
      return;
    }

    const result = await saveMoneyAccountUseCase.execute({
      remoteId: remoteIdForSave,
      ownerUserRemoteId: activeUserRemoteId,
      scopeAccountRemoteId,
      scopeAccountDisplayNameSnapshot: scopeAccountDisplayName,
      name: form.name.trim(),
      type: form.type,
      currentBalance: balanceForSave,
      description: form.description.trim() || null,
      currencyCode,
      isPrimary: existingRecord?.isPrimary ?? isFirstScopeAccount,
      isActive: true,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setAccounts((currentAccounts) =>
      sortAccounts(
        (() => {
          const existingIndex = currentAccounts.findIndex(
            (account) => account.remoteId === result.value.remoteId,
          );
          if (existingIndex === -1) {
            return [result.value, ...currentAccounts];
          }
          return currentAccounts.map((account, index) =>
            index === existingIndex ? result.value : account,
          );
        })(),
      ),
    );
    setErrorMessage(null);
    setIsEditorVisible(false);
    setForm(createEmptyForm());
    void loadMoneyAccounts();
  }, [
    accounts,
    activeUserRemoteId,
    canManage,
    currencyCode,
    editorMode,
    form,
    loadMoneyAccounts,
    saveMoneyAccountUseCase,
    scopeAccountDisplayName,
    scopeAccountRemoteId,
  ]);

  const onOpenHistoryForCurrent = useCallback(() => {
    if (editorMode !== "edit" || !form.remoteId) {
      return;
    }

    const targetAccount = accounts.find(
      (account) => account.remoteId === form.remoteId,
    );
    if (!targetAccount) {
      setErrorMessage("Money account not found.");
      return;
    }

    onOpenAccountHistory(targetAccount.remoteId, targetAccount.name);
  }, [accounts, editorMode, form.remoteId, onOpenAccountHistory]);

  const onOpenAdjustmentForCurrent = useCallback(() => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage money accounts.");
      return;
    }

    if (editorMode !== "edit" || !form.remoteId) {
      return;
    }

    const targetAccount = accounts.find(
      (account) => account.remoteId === form.remoteId,
    );
    if (!targetAccount) {
      setErrorMessage("Money account not found.");
      return;
    }

    setAdjustmentForm({
      moneyAccountRemoteId: targetAccount.remoteId,
      accountName: targetAccount.name,
      currentBalanceLabel: formatCurrencyAmount({
        amount: targetAccount.currentBalance,
        currencyCode,
        countryCode: activeAccountCountryCode,
      }),
      targetBalance: String(targetAccount.currentBalance),
      reason: "",
      fieldErrors: {},
      errorMessage: null,
      isSaving: false,
    });
    setIsEditorVisible(false);
    setIsAdjustmentModalVisible(true);
  }, [
    accounts,
    activeAccountCountryCode,
    canManage,
    currencyCode,
    editorMode,
    form.remoteId,
  ]);

  const onCloseAdjustment = useCallback(() => {
    if (adjustmentForm.isSaving) {
      return;
    }

    setIsAdjustmentModalVisible(false);
    setAdjustmentForm(createEmptyAdjustmentForm());
  }, [adjustmentForm.isSaving]);

  const onAdjustmentFormChange = useCallback(
    (
      field: keyof Pick<MoneyAccountAdjustmentFormState, "targetBalance" | "reason">,
      value: string,
    ) => {
      setAdjustmentForm((current) => {
        const nextFieldErrors =
          field === "targetBalance"
            ? clearAdjustmentFieldError(current.fieldErrors, "targetBalance")
            : clearAdjustmentFieldError(current.fieldErrors, "reason");

        return {
          ...current,
          [field]: value,
          fieldErrors: nextFieldErrors,
          errorMessage: null,
        };
      });
    },
    [],
  );

  const onSubmitAdjustment = useCallback(async () => {
    if (!canManage) {
      setAdjustmentForm((current) => ({
        ...current,
        errorMessage: "You do not have permission to manage money accounts.",
      }));
      return;
    }

    if (!activeUserRemoteId || !scopeAccountRemoteId) {
      setAdjustmentForm((current) => ({
        ...current,
        errorMessage: "An active account context is required.",
      }));
      return;
    }

    if (!scopeAccountDisplayName.trim()) {
      setAdjustmentForm((current) => ({
        ...current,
        errorMessage: "Account label is required.",
      }));
      return;
    }

    if (!adjustmentForm.moneyAccountRemoteId) {
      setAdjustmentForm((current) => ({
        ...current,
        errorMessage: "Money account is required.",
      }));
      return;
    }

    const nextFieldErrors = validateMoneyAccountAdjustmentForm({
      targetBalance: adjustmentForm.targetBalance,
      reason: adjustmentForm.reason,
    });

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setAdjustmentForm((current) => ({
        ...current,
        fieldErrors: nextFieldErrors,
        errorMessage: null,
      }));
      return;
    }

    const parsedTargetBalance = parseBalance(adjustmentForm.targetBalance);
    if (parsedTargetBalance === null) {
      setAdjustmentForm((current) => ({
        ...current,
        fieldErrors: {
          ...current.fieldErrors,
          targetBalance: "Correct balance is required.",
        },
        errorMessage: null,
      }));
      return;
    }

    setAdjustmentForm((current) => ({
      ...current,
      fieldErrors: {},
      errorMessage: null,
      isSaving: true,
    }));

    const result = await adjustMoneyAccountBalanceUseCase.execute({
      ownerUserRemoteId: activeUserRemoteId,
      scopeAccountRemoteId,
      scopeAccountDisplayNameSnapshot: scopeAccountDisplayName,
      moneyAccountRemoteId: adjustmentForm.moneyAccountRemoteId,
      targetBalance: parsedTargetBalance,
      reason: adjustmentForm.reason.trim(),
      adjustedAt: Date.now(),
    });

    if (!result.success) {
      setAdjustmentForm((current) => ({
        ...current,
        errorMessage: result.error.message,
        isSaving: false,
      }));
      return;
    }

    setAccounts((currentAccounts) =>
      sortAccounts(
        currentAccounts.map((account) =>
          account.remoteId === result.value.remoteId ? result.value : account,
        ),
      ),
    );
    setIsAdjustmentModalVisible(false);
    setAdjustmentForm(createEmptyAdjustmentForm());
    setErrorMessage(null);
    void loadMoneyAccounts();
  }, [
    activeUserRemoteId,
    adjustMoneyAccountBalanceUseCase,
    adjustmentForm.moneyAccountRemoteId,
    adjustmentForm.reason,
    adjustmentForm.targetBalance,
    canManage,
    loadMoneyAccounts,
    scopeAccountDisplayName,
    scopeAccountRemoteId,
  ]);

  const canDeleteCurrent = useMemo(() => {
    if (editorMode !== "edit" || !form.remoteId) {
      return false;
    }

    const targetAccount = accounts.find(
      (account) => account.remoteId === form.remoteId,
    );
    if (!targetAccount) {
      return false;
    }

    if (targetAccount.isPrimary) {
      return false;
    }

    return accounts.length > 1;
  }, [accounts, editorMode, form.remoteId]);

  const onRequestDeleteCurrent = useCallback((): void => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage money accounts.");
      return;
    }

    if (editorMode !== "edit" || !form.remoteId) {
      return;
    }

    const targetAccount = accounts.find(
      (account) => account.remoteId === form.remoteId,
    );
    if (!targetAccount) {
      setErrorMessage("Money account not found.");
      return;
    }
    if (targetAccount.isPrimary) {
      setErrorMessage("Primary account cannot be deleted.");
      return;
    }
    if (accounts.length <= 1) {
      setErrorMessage("At least one active account is required.");
      return;
    }

    setPendingDeleteRemoteId(targetAccount.remoteId);
    setDeleteErrorMessage(null);
  }, [accounts, canManage, editorMode, form.remoteId]);

  const onCloseDeleteModal = useCallback((): void => {
    if (isDeleting) {
      return;
    }
    setPendingDeleteRemoteId(null);
    setDeleteErrorMessage(null);
  }, [isDeleting]);

  const onConfirmDelete = useCallback(async (): Promise<void> => {
    if (!canManage) {
      setDeleteErrorMessage("You do not have permission to manage money accounts.");
      return;
    }
    if (!pendingDeleteRemoteId) {
      return;
    }

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    const archiveMoneyAccountResult = await archiveMoneyAccountUseCase.execute(
      pendingDeleteRemoteId,
    );
    setIsDeleting(false);

    if (!archiveMoneyAccountResult.success) {
      setDeleteErrorMessage(archiveMoneyAccountResult.error.message);
      return;
    }

    setAccounts((currentAccounts) =>
      sortAccounts(
        currentAccounts.filter(
          (account) => account.remoteId !== pendingDeleteRemoteId,
        ),
      ),
    );
    setPendingDeleteRemoteId(null);
    setDeleteErrorMessage(null);
    setErrorMessage(null);
    setIsEditorVisible(false);
    setForm(createEmptyForm());
    void loadMoneyAccounts();
  }, [
    archiveMoneyAccountUseCase,
    canManage,
    loadMoneyAccounts,
    pendingDeleteRemoteId,
  ]);

  const pendingDeleteAccountName = useMemo(() => {
    if (!pendingDeleteRemoteId) {
      return null;
    }
    const account = accounts.find(
      (item) => item.remoteId === pendingDeleteRemoteId,
    );
    return account?.name ?? null;
  }, [accounts, pendingDeleteRemoteId]);

  return useMemo(
    () => ({
      isLoading,
      errorMessage,
      canManage,
      currencyCode,
      countryCode: activeAccountCountryCode,
      currencyLabel: currencyCode,
      totalBalanceLabel: formatCurrencyAmount({
        amount: totalBalance,
        currencyCode,
        countryCode: activeAccountCountryCode,
      }),
      accounts,
      isEditorVisible,
      editorMode,
      form,
      adjustmentForm,
      canDeleteCurrent,
      isDeleteModalVisible: Boolean(pendingDeleteRemoteId),
      isAdjustmentModalVisible,
      pendingDeleteAccountName,
      deleteErrorMessage,
      isDeleting,
      onRefresh: loadMoneyAccounts,
      onOpenCreate,
      onOpenEdit,
      onCloseEditor,
      onFormChange,
      onSubmit,
      onOpenHistoryForCurrent,
      onOpenAdjustmentForCurrent,
      onCloseAdjustment,
      onAdjustmentFormChange,
      onSubmitAdjustment,
      onRequestDeleteCurrent,
      onCloseDeleteModal,
      onConfirmDelete,
    }),
    [
      accounts,
      activeAccountCountryCode,
      adjustmentForm,
      canDeleteCurrent,
      canManage,
      currencyCode,
      deleteErrorMessage,
      editorMode,
      errorMessage,
      form,
      isAdjustmentModalVisible,
      isDeleting,
      isEditorVisible,
      isLoading,
      loadMoneyAccounts,
      onAdjustmentFormChange,
      onCloseAdjustment,
      onCloseDeleteModal,
      onCloseEditor,
      onConfirmDelete,
      onFormChange,
      onOpenAdjustmentForCurrent,
      onOpenCreate,
      onOpenEdit,
      onOpenHistoryForCurrent,
      onRequestDeleteCurrent,
      onSubmit,
      onSubmitAdjustment,
      pendingDeleteAccountName,
      pendingDeleteRemoteId,
      totalBalance,
    ],
  );
};
