import {
  Account,
  AccountTypeValue,
} from "../types/accountSelection.types";

export interface AccountSelectionViewModel {
  accounts: readonly Account[];
  selectedAccountRemoteId: string | null;
  isCreateMode: boolean;
  canStartCreateMode: boolean;
  canCancelCreateMode: boolean;
  newAccountType: AccountTypeValue;
  newAccountDisplayName: string;
  isLoading: boolean;
  isSubmitting: boolean;
  submitError?: string;
  successMessage?: string;
  onSelectAccount: (accountRemoteId: string) => void;
  onStartCreateMode: () => void;
  onCancelCreateMode: () => void;
  onChangeNewAccountType: (accountType: AccountTypeValue) => void;
  onChangeNewAccountDisplayName: (displayName: string) => void;
  onConfirmSelection: () => Promise<void>;
  onBackToLogin: () => void;
}
