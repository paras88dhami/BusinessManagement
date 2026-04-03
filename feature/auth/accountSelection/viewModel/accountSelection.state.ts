import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Account } from "../types/accountSelection.types";

export type AccountSelectionState = {
  accounts: Account[];
  selectedAccountRemoteId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  successMessage: string | null;
};

export type AccountSelectionStateActions = {
  setAccounts: Dispatch<SetStateAction<Account[]>>;
  setSelectedAccountRemoteId: Dispatch<SetStateAction<string | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setSubmitError: Dispatch<SetStateAction<string | null>>;
  setSuccessMessage: Dispatch<SetStateAction<string | null>>;
  clearFeedback: () => void;
};

export const useAccountSelectionState = (): {
  state: AccountSelectionState;
  actions: AccountSelectionStateActions;
} => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountRemoteId, setSelectedAccountRemoteId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearFeedback = useCallback(() => {
    setSubmitError(null);
    setSuccessMessage(null);
  }, []);

  const state = useMemo<AccountSelectionState>(
    () => ({
      accounts,
      selectedAccountRemoteId,
      isLoading,
      isSubmitting,
      submitError,
      successMessage,
    }),
    [
      accounts,
      selectedAccountRemoteId,
      isLoading,
      isSubmitting,
      submitError,
      successMessage,
    ],
  );

  const actions = useMemo<AccountSelectionStateActions>(
    () => ({
      setAccounts,
      setSelectedAccountRemoteId,
      setIsLoading,
      setIsSubmitting,
      setSubmitError,
      setSuccessMessage,
      clearFeedback,
    }),
    [clearFeedback],
  );

  return { state, actions };
};
