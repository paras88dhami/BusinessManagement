import { Database } from "@nozbe/watermelondb";
import { useCallback, useMemo } from "react";
import { setActiveAccountSession } from "@/feature/appSettings/data/appSettings.store";
import {
  Account,
  SelectedAccountContext,
} from "../types/accountSelection.types";
import {
  AccountSelectionState,
  AccountSelectionStateActions,
} from "./accountSelection.state";
import { AccountSelectionSubmitViewModel } from "./accountSelection.submit.viewModel";

type UseAccountSelectionSubmitViewModelParams = {
  database: Database;
  state: AccountSelectionState;
  actions: AccountSelectionStateActions;
  onAccountSelected?: (
    selectedAccountContext: SelectedAccountContext,
  ) => Promise<void> | void;
};

export const useAccountSelectionSubmitViewModel = (
  params: UseAccountSelectionSubmitViewModelParams,
): AccountSelectionSubmitViewModel => {
  const { database, state, actions, onAccountSelected } = params;

  const onConfirmSelection = useCallback(async (): Promise<void> => {
    actions.setIsSubmitting(true);
    actions.clearFeedback();

    try {
      const targetAccount: Account | undefined = state.accounts.find(
        (account) => account.remoteId === state.selectedAccountRemoteId,
      );

      if (!targetAccount) {
        actions.setSubmitError("Please select an account to continue.");
        return;
      }

      await setActiveAccountSession(database, targetAccount.remoteId);

      if (onAccountSelected) {
        await onAccountSelected({
          accountRemoteId: targetAccount.remoteId,
          accountType: targetAccount.accountType,
        });
      }

      actions.setSuccessMessage("Account selection saved.");
    } catch (error) {
      actions.setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to save selected account. Please try again.",
      );
    } finally {
      actions.setIsSubmitting(false);
    }
  }, [
    actions,
    database,
    onAccountSelected,
    state.accounts,
    state.selectedAccountRemoteId,
  ]);

  return useMemo<AccountSelectionSubmitViewModel>(
    () => ({
      isSubmitting: state.isSubmitting,
      submitError: state.submitError,
      successMessage: state.successMessage,
      onConfirmSelection,
    }),
    [onConfirmSelection, state.isSubmitting, state.submitError, state.successMessage],
  );
};
