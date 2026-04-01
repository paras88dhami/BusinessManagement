import { Database } from "@nozbe/watermelondb";
import { useEffect, useMemo } from "react";
import { SelectedAccountContext } from "../types/accountSelection.types";
import { GetAccountsByOwnerUserRemoteIdUseCase } from "../useCase/getAccountsByOwnerUserRemoteId.useCase";
import { useAccountSelectionLoadViewModel } from "./accountSelection.load.viewModel.impl";
import { useAccountSelectionSelectViewModel } from "./accountSelection.select.viewModel.impl";
import { useAccountSelectionState } from "./accountSelection.state";
import { useAccountSelectionSubmitViewModel } from "./accountSelection.submit.viewModel.impl";
import { AccountSelectionViewModel } from "./accountSelection.viewModel";

export type UseAccountSelectionViewModelParams = {
  database: Database;
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  getAccountsByOwnerUserRemoteIdUseCase: GetAccountsByOwnerUserRemoteIdUseCase;
  onBackToLogin: () => void;
  onAccountSelected?: (
    selectedAccountContext: SelectedAccountContext,
  ) => Promise<void> | void;
};

export function useAccountSelectionViewModel(
  params: UseAccountSelectionViewModelParams,
): AccountSelectionViewModel {
  const {
    database,
    activeUserRemoteId,
    activeAccountRemoteId,
    getAccountsByOwnerUserRemoteIdUseCase,
    onBackToLogin,
    onAccountSelected,
  } = params;

  const { state, actions } = useAccountSelectionState();

  const loadViewModel = useAccountSelectionLoadViewModel({
    activeUserRemoteId,
    activeAccountRemoteId,
    state,
    actions,
    getAccountsByOwnerUserRemoteIdUseCase,
  });

  const selectViewModel = useAccountSelectionSelectViewModel({
    state,
    actions,
  });

  const submitViewModel = useAccountSelectionSubmitViewModel({
    database,
    state,
    actions,
    onAccountSelected,
  });
  const load = loadViewModel.load;

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo<AccountSelectionViewModel>(
    () => ({
      accounts: state.accounts,
      selectedAccountRemoteId: selectViewModel.selectedAccountRemoteId,
      isLoading: loadViewModel.isLoading,
      load: loadViewModel.load,
      isSubmitting: submitViewModel.isSubmitting,
      submitError: submitViewModel.submitError,
      successMessage: submitViewModel.successMessage,
      onSelectAccount: selectViewModel.onSelectAccount,
      onConfirmSelection: submitViewModel.onConfirmSelection,
      onBackToLogin,
    }),
    [
      state.accounts,
      selectViewModel.selectedAccountRemoteId,
      loadViewModel.isLoading,
      loadViewModel.load,
      submitViewModel.isSubmitting,
      submitViewModel.submitError,
      submitViewModel.successMessage,
      selectViewModel.onSelectAccount,
      submitViewModel.onConfirmSelection,
      onBackToLogin,
    ],
  );
}
