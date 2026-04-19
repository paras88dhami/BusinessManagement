import {
  MoneyAccount,
  MoneyAccountType,
} from "@/feature/accounts/types/moneyAccount.types";
import { ContactType } from "@/feature/contacts/types/contact.types";
import {
  LedgerEntryType,
  LedgerEntryTypeValue,
} from "@/feature/ledger/types/ledger.entity.types";
import {
  LedgerAccountOptionState,
  LedgerEditorFieldErrors,
  LedgerEditorFormState,
  LedgerEntryTypeOptionState,
} from "@/feature/ledger/types/ledger.state.types";
import { formatDateInput, getLedgerEntryTypeLabel } from "./ledger.shared";

export type LedgerEditorInternalState = LedgerEditorFormState & {
  editingRemoteId: string | null;
  linkedDocumentRemoteId: string | null;
  linkedTransactionRemoteId: string | null;
};

export const DEFAULT_LEDGER_EDITOR_STATE: LedgerEditorInternalState = {
  visible: false,
  mode: "create",
  editingRemoteId: null,
  entryType: LedgerEntryType.Sale,
  partyName: "",
  amount: "",
  happenedAt: formatDateInput(Date.now()),
  dueAt: "",
  settlementAccountRemoteId: "",
  referenceNumber: "",
  note: "",
  reminderAt: "",
  attachmentUri: "",
  settledAgainstEntryRemoteId: "",
  linkedDocumentRemoteId: null,
  linkedTransactionRemoteId: null,
  showMoreDetails: false,
  fieldErrors: {},
  isSaving: false,
  errorMessage: null,
};

export const LEDGER_EDITOR_ENTRY_TYPE_OPTIONS: readonly LedgerEntryTypeOptionState[] =
  [
    { value: LedgerEntryType.Sale, label: "Sale Due" },
    { value: LedgerEntryType.Purchase, label: "Purchase Due" },
    { value: LedgerEntryType.Collection, label: "Receive Money" },
    { value: LedgerEntryType.PaymentOut, label: "Pay Money" },
  ] as const;

export const createLedgerRemoteId = (): string => {
  return `led-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const resolveContactTypeForEntryType = (
  entryType: LedgerEntryTypeValue,
): (typeof ContactType)[keyof typeof ContactType] => {
  if (
    entryType === LedgerEntryType.Sale ||
    entryType === LedgerEntryType.Collection
  ) {
    return ContactType.Customer;
  }

  if (
    entryType === LedgerEntryType.Purchase ||
    entryType === LedgerEntryType.PaymentOut
  ) {
    return ContactType.Supplier;
  }

  return ContactType.Other;
};

export const mapMoneyAccountToSettlementOption = (
  moneyAccount: MoneyAccount,
): LedgerAccountOptionState => {
  const accountTypeLabel =
    moneyAccount.type === MoneyAccountType.Cash
      ? "Cash"
      : moneyAccount.type === MoneyAccountType.Bank
        ? "Bank"
        : "Wallet";
  const primaryTag = moneyAccount.isPrimary ? " (Primary)" : "";

  return {
    remoteId: moneyAccount.remoteId,
    label: `${moneyAccount.name} | ${accountTypeLabel}${primaryTag}`,
    currencyCode: moneyAccount.currencyCode,
  };
};

export const buildAutoTitle = (
  entryType: LedgerEntryTypeValue,
  partyName: string,
): string => {
  const actionLabel = getLedgerEntryTypeLabel(entryType);
  if (!partyName.trim()) {
    return actionLabel;
  }

  return `${actionLabel} - ${partyName.trim()}`;
};

export const clearFieldError = (
  fieldErrors: LedgerEditorFieldErrors,
  field: keyof LedgerEditorFieldErrors,
): LedgerEditorFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};
