import { useCallback, useMemo } from "react";
import { GetAccountsByOwnerUserRemoteIdUseCase } from "../useCase/getAccountsByOwnerUserRemoteId.useCase";
import {
  AccountSelectionState,
  AccountSelectionStateActions,
} from "./accountSelection.state";
import { AccountSelectionLoadViewModel } from "./accountSelection.load.viewModel";

type UseAccountSelectionLoadViewModelParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  state: AccountSelectionState;
  actions: AccountSelectionStateActions;
  getAccountsByOwnerUserRemoteIdUseCase: GetAccountsByOwnerUserRemoteIdUseCase;
};

export const useAccountSelectionLoadViewModel = (
  params: UseAccountSelectionLoadViewModelParams,
): AccountSelectionLoadViewModel => {
  const {
    activeUserRemoteId,
    activeAccountRemoteId,
    state,
    actions,
    getAccountsByOwnerUserRemoteIdUseCase,
  } = params;

  const load = useCallback(async (): Promise<void> => {
    actions.setIsLoading(true);
    actions.clearFeedback();

    try {
      if (!activeUserRemoteId) {
        actions.setAccounts([]);
        actions.setSelectedAccountRemoteId(null);
        actions.setSubmitError("Active user session not found. Please log in again.");
        return;
      }

      const accountsResult = await getAccountsByOwnerUserRemoteIdUseCase.execute(
        activeUserRemoteId,
      );

      if (!accountsResult.success) {
        actions.setAccounts([]);
        actions.setSelectedAccountRemoteId(null);
        actions.setSubmitError(accountsResult.error.message);
        return;
      }

      const availableAccounts = accountsResult.value;

      if (availableAccounts.length === 0) {
        actions.setAccounts([]);
        actions.setSelectedAccountRemoteId(null);
        return;
      }

      actions.setAccounts(availableAccounts);
      const hasPersistedAccount = Boolean(
        activeAccountRemoteId &&
          availableAccounts.some(
            (account) => account.remoteId === activeAccountRemoteId,
          ),
      );

      const defaultAccountRemoteId =
        availableAccounts.find((account) => account.isDefault)?.remoteId ??
        availableAccounts[0].remoteId;

      actions.setSelectedAccountRemoteId(
        hasPersistedAccount ? activeAccountRemoteId! : defaultAccountRemoteId,
      );
    } catch (error) {
      actions.setAccounts([]);
      actions.setSelectedAccountRemoteId(null);
      actions.setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to load accounts. Please try again.",
      );
    } finally {
      actions.setIsLoading(false);
    }
  }, [
    activeAccountRemoteId,
    activeUserRemoteId,
    actions,
    getAccountsByOwnerUserRemoteIdUseCase,
  ]);

  return useMemo<AccountSelectionLoadViewModel>(
    () => ({
      isLoading: state.isLoading,
      load,
    }),
    [load, state.isLoading],
  );
};
