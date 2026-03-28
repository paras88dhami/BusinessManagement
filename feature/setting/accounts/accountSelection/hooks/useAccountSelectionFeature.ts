import { Database } from "@nozbe/watermelondb";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as Crypto from "expo-crypto";
import {
  getAppSessionState,
  setActiveAccountSession,
} from "@/feature/appSettings/data/appSettings.store";
import { GetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase";
import {
  Account,
  AccountType,
  AccountTypeValue,
} from "../types/accountSelection.types";
import { GetAccountsByOwnerUserRemoteIdUseCase } from "../useCase/getAccountsByOwnerUserRemoteId.useCase";
import { SaveAccountUseCase } from "../useCase/saveAccount.useCase";
import { AccountSelectionViewModel } from "../viewModel/accountSelection.viewModel";

type UseAccountSelectionFeatureParams = {
  database: Database;
  getAccountsByOwnerUserRemoteIdUseCase: GetAccountsByOwnerUserRemoteIdUseCase;
  saveAccountUseCase: SaveAccountUseCase;
  getAuthUserByRemoteIdUseCase: GetAuthUserByRemoteIdUseCase;
  onBackToLogin: () => void;
  onAccountSelected?: (accountRemoteId: string) => Promise<void> | void;
};

const sortAccounts = (accounts: Account[]): Account[] => {
  return [...accounts].sort((leftAccount, rightAccount) => {
    if (leftAccount.isDefault !== rightAccount.isDefault) {
      return leftAccount.isDefault ? -1 : 1;
    }

    return rightAccount.updatedAt - leftAccount.updatedAt;
  });
};

export function useAccountSelectionFeature(
  params: UseAccountSelectionFeatureParams,
): AccountSelectionViewModel {
  const {
    database,
    getAccountsByOwnerUserRemoteIdUseCase,
    saveAccountUseCase,
    getAuthUserByRemoteIdUseCase,
    onBackToLogin,
    onAccountSelected,
  } = params;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountRemoteId, setSelectedAccountRemoteId] = useState<
    string | null
  >(null);
  const [activeUserRemoteId, setActiveUserRemoteId] = useState<string | null>(
    null,
  );
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newAccountType, setNewAccountType] = useState<AccountTypeValue>(
    AccountType.Personal,
  );
  const [newAccountDisplayName, setNewAccountDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  useEffect(() => {
    let isMounted = true;

    const loadAccounts = async (): Promise<void> => {
      setIsLoading(true);
      setSubmitError(undefined);
      setSuccessMessage(undefined);

      try {
        const sessionState = await getAppSessionState(database);
        const activeUserRemoteId = sessionState.activeUserRemoteId;
        setActiveUserRemoteId(activeUserRemoteId);

        if (!activeUserRemoteId) {
          if (!isMounted) {
            return;
          }

          setAccounts([]);
          setSelectedAccountRemoteId(null);
          setIsCreateMode(false);
          setNewAccountDisplayName("");
          setSubmitError("Active user session not found. Please log in again.");
          return;
        }

        const accountsResult =
          await getAccountsByOwnerUserRemoteIdUseCase.execute(activeUserRemoteId);

        if (!isMounted) {
          return;
        }

        if (!accountsResult.success) {
          setAccounts([]);
          setSelectedAccountRemoteId(null);
          setIsCreateMode(false);
          setNewAccountDisplayName("");
          setSubmitError(accountsResult.error.message);
          return;
        }

        const availableAccounts = accountsResult.value;

        if (availableAccounts.length === 0) {
          const authUserResult =
            await getAuthUserByRemoteIdUseCase.execute(activeUserRemoteId);

          if (!isMounted) {
            return;
          }

          if (!authUserResult.success) {
            setAccounts([]);
            setSelectedAccountRemoteId(null);
            setIsCreateMode(false);
            setNewAccountDisplayName("");
            setSubmitError(authUserResult.error.message);
            return;
          }

          setAccounts([]);
          setSelectedAccountRemoteId(null);
          setIsCreateMode(true);
          setNewAccountType(AccountType.Personal);
          setNewAccountDisplayName(authUserResult.value.fullName.trim());
          return;
        }

        setAccounts(availableAccounts);
        setIsCreateMode(false);
        setNewAccountType(AccountType.Personal);
        setNewAccountDisplayName("");

        const persistedActiveAccountId = sessionState.activeAccountRemoteId;
        const hasPersistedAccount = Boolean(
          persistedActiveAccountId &&
            availableAccounts.some(
              (account) => account.remoteId === persistedActiveAccountId,
            ),
        );

        const defaultAccountRemoteId =
          availableAccounts.find((account) => account.isDefault)?.remoteId ??
          availableAccounts[0].remoteId;

        setSelectedAccountRemoteId(
          hasPersistedAccount ? persistedActiveAccountId! : defaultAccountRemoteId,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAccounts([]);
        setSelectedAccountRemoteId(null);
        setIsCreateMode(false);
        setNewAccountDisplayName("");
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Failed to load accounts. Please try again.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAccounts();

    return () => {
      isMounted = false;
    };
  }, [
    database,
    getAccountsByOwnerUserRemoteIdUseCase,
    getAuthUserByRemoteIdUseCase,
  ]);

  const onSelectAccount = useCallback(
    (accountRemoteId: string): void => {
      if (!accounts.some((account) => account.remoteId === accountRemoteId)) {
        return;
      }

      setSelectedAccountRemoteId(accountRemoteId);
      setSubmitError(undefined);
      setSuccessMessage(undefined);
    },
    [accounts],
  );

  const onChangeNewAccountType = useCallback((accountType: AccountTypeValue) => {
    setNewAccountType(accountType);
    setSubmitError(undefined);
    setSuccessMessage(undefined);
  }, []);

  const onChangeNewAccountDisplayName = useCallback((displayName: string) => {
    setNewAccountDisplayName(displayName);
    setSubmitError(undefined);
    setSuccessMessage(undefined);
  }, []);

  const onStartCreateMode = useCallback(() => {
    setIsCreateMode(true);
    setNewAccountType(AccountType.Personal);
    setNewAccountDisplayName("");
    setSubmitError(undefined);
    setSuccessMessage(undefined);
  }, []);

  const onCancelCreateMode = useCallback(() => {
    if (accounts.length === 0) {
      return;
    }

    setIsCreateMode(false);
    setNewAccountType(AccountType.Personal);
    setNewAccountDisplayName("");
    setSubmitError(undefined);
    setSuccessMessage(undefined);
  }, [accounts.length]);

  const onConfirmSelection = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(undefined);
    setSuccessMessage(undefined);

    try {
      let targetAccountRemoteId = selectedAccountRemoteId;

      if (isCreateMode) {
        if (!activeUserRemoteId) {
          setSubmitError("Active user session not found. Please log in again.");
          return;
        }

        const normalizedDisplayName = newAccountDisplayName.trim();

        if (!normalizedDisplayName) {
          setSubmitError("Account name is required.");
          return;
        }

        const saveAccountResult = await saveAccountUseCase.execute({
          remoteId: Crypto.randomUUID(),
          ownerUserRemoteId: activeUserRemoteId,
          accountType: newAccountType,
          displayName: normalizedDisplayName,
          currencyCode: null,
          cityOrLocation: null,
          countryCode: null,
          isActive: true,
          isDefault: accounts.length === 0,
        });

        if (!saveAccountResult.success) {
          setSubmitError(saveAccountResult.error.message);
          return;
        }

        const createdAccount = saveAccountResult.value;
        setAccounts((previousAccounts) =>
          sortAccounts([...previousAccounts, createdAccount]),
        );
        setSelectedAccountRemoteId(createdAccount.remoteId);
        setIsCreateMode(false);
        setNewAccountType(AccountType.Personal);
        setNewAccountDisplayName("");
        targetAccountRemoteId = createdAccount.remoteId;
      } else if (
        !targetAccountRemoteId ||
        !accounts.some((account) => account.remoteId === targetAccountRemoteId)
      ) {
        setSubmitError("Please select an account to continue.");
        return;
      }

      await setActiveAccountSession(database, targetAccountRemoteId);

      if (onAccountSelected) {
        await onAccountSelected(targetAccountRemoteId);
      }

      setSuccessMessage("Account selection saved.");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to save selected account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeUserRemoteId,
    database,
    accounts,
    isCreateMode,
    newAccountDisplayName,
    newAccountType,
    onAccountSelected,
    saveAccountUseCase,
    selectedAccountRemoteId,
  ]);

  const canStartCreateMode = !isCreateMode && accounts.length > 0;
  const canCancelCreateMode = isCreateMode && accounts.length > 0;

  return useMemo<AccountSelectionViewModel>(
    () => ({
      accounts,
      selectedAccountRemoteId,
      isCreateMode,
      canStartCreateMode,
      canCancelCreateMode,
      newAccountType,
      newAccountDisplayName,
      isLoading,
      isSubmitting,
      submitError,
      successMessage,
      onSelectAccount,
      onStartCreateMode,
      onCancelCreateMode,
      onChangeNewAccountType,
      onChangeNewAccountDisplayName,
      onConfirmSelection,
      onBackToLogin,
    }),
    [
      accounts,
      selectedAccountRemoteId,
      isCreateMode,
      canStartCreateMode,
      canCancelCreateMode,
      newAccountType,
      newAccountDisplayName,
      isLoading,
      isSubmitting,
      submitError,
      successMessage,
      onSelectAccount,
      onStartCreateMode,
      onCancelCreateMode,
      onChangeNewAccountType,
      onChangeNewAccountDisplayName,
      onConfirmSelection,
      onBackToLogin,
    ],
  );
}
