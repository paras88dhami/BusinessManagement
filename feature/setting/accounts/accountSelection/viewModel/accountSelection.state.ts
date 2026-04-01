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
  submitError?: string;
  successMessage?: string;
};

export type AccountSelectionStateActions = {
  setAccounts: Dispatch<SetStateAction<Account[]>>;
  setSelectedAccountRemoteId: Dispatch<SetStateAction<string | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
  setSuccessMessage: Dispatch<SetStateAction<string | undefined>>;
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
  const [submitError, setSubmitError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const clearFeedback = useCallback(() => {
    setSubmitError(undefined);
    setSuccessMessage(undefined);
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
