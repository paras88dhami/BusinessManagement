import {
  MoneyAccount,
  MoneyAccountTypeValue,
} from "@/feature/accounts/types/moneyAccount.types";

export type MoneyAccountFormState = {
  remoteId: string | null;
  name: string;
  type: MoneyAccountTypeValue;
  balance: string;
  description: string;
};

export type MoneyAccountAdjustmentFormState = {
  moneyAccountRemoteId: string | null;
  accountName: string;
  currentBalanceLabel: string;
  targetBalance: string;
  reason: string;
  errorMessage: string | null;
  isSaving: boolean;
};

export interface MoneyAccountsViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  canManage: boolean;
  currencyCode: string;
  countryCode: string | null;
  currencyLabel: string;
  totalBalanceLabel: string;
  accounts: readonly MoneyAccount[];
  isEditorVisible: boolean;
  editorMode: "create" | "edit";
  form: MoneyAccountFormState;
  adjustmentForm: MoneyAccountAdjustmentFormState;
  canDeleteCurrent: boolean;
  isDeleteModalVisible: boolean;
  isAdjustmentModalVisible: boolean;
  pendingDeleteAccountName: string | null;
  deleteErrorMessage: string | null;
  isDeleting: boolean;
  onRefresh: () => Promise<void>;
  onOpenCreate: () => void;
  onOpenEdit: (account: MoneyAccount) => void;
  onCloseEditor: () => void;
  onFormChange: (field: keyof MoneyAccountFormState, value: string) => void;
  onSubmit: () => Promise<void>;
  onOpenHistoryForCurrent: () => void;
  onOpenAdjustmentForCurrent: () => void;
  onCloseAdjustment: () => void;
  onAdjustmentFormChange: (
    field: keyof Pick<MoneyAccountAdjustmentFormState, "targetBalance" | "reason">,
    value: string,
  ) => void;
  onSubmitAdjustment: () => Promise<void>;
  onRequestDeleteCurrent: () => void;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => Promise<void>;
}
