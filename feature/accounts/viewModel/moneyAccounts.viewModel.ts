import {
  MoneyAccount,
  MoneyAccountTypeValue,
} from "@/feature/accounts/types/moneyAccount.types";

export type MoneyAccountFormFieldName = "name" | "balance";

export type MoneyAccountFormFieldErrors = Partial<
  Record<MoneyAccountFormFieldName, string>
>;

export type MoneyAccountAdjustmentFieldName = "targetBalance" | "reason";

export type MoneyAccountAdjustmentFieldErrors = Partial<
  Record<MoneyAccountAdjustmentFieldName, string>
>;

export type MoneyAccountFormState = {
  remoteId: string | null;
  name: string;
  type: MoneyAccountTypeValue;
  balance: string;
  description: string;
  fieldErrors: MoneyAccountFormFieldErrors;
};

export type MoneyAccountAdjustmentFormState = {
  moneyAccountRemoteId: string | null;
  accountName: string;
  currentBalanceLabel: string;
  targetBalance: string;
  reason: string;
  fieldErrors: MoneyAccountAdjustmentFieldErrors;
  errorMessage: string | null;
  isSaving: boolean;
};

export interface MoneyAccountsViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
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
  onFormChange: (
    field: keyof Omit<MoneyAccountFormState, "fieldErrors">,
    value: string,
  ) => void;
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
