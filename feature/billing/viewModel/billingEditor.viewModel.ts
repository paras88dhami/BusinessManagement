import { BillingDocument } from "@/feature/billing/types/billing.types";
import { RunBillingDocumentIssueUseCase } from "@/feature/billing/workflow/billingDocumentIssue/useCase/runBillingDocumentIssue.useCase";
import {
  BillingDocumentFormState,
  BillingLineItemFormState,
  BillingSettlementAccountOption,
  BillingTabValue,
} from "./billing.viewModel";
import { BillingDraftTotals } from "./billingViewModel.shared";
import {
  RunPostIssuePaymentParams,
  ValidateSettlementAccountForPaidNowParams,
} from "./billingPayment.viewModel";

export type UseBillingEditorViewModelParams = {
  accountRemoteId: string | null;
  ownerUserRemoteId: string | null;
  activeTab: BillingTabValue;
  canManage: boolean;
  defaultTaxRatePercent: string;
  availableSettlementAccounts: readonly BillingSettlementAccountOption[];
  runBillingDocumentIssueUseCase: RunBillingDocumentIssueUseCase;
  onRefresh: () => Promise<void>;
  setErrorMessage: (message: string | null) => void;
  // Kept optional for compatibility with existing caller wiring.
  validateSettlementAccountForPaidNow?: (
    params: ValidateSettlementAccountForPaidNowParams,
  ) => string | null;
  runPostIssuePayment: (params: RunPostIssuePaymentParams) => Promise<boolean>;
};

export type BillingEditorViewModelModule = {
  isEditorVisible: boolean;
  editorTitle: string;
  form: BillingDocumentFormState;
  draftTotals: BillingDraftTotals;
  onOpenCreate: () => void;
  onOpenEdit: (document: BillingDocument) => void;
  onCloseEditor: () => void;
  onFormChange: (
    field: keyof Omit<BillingDocumentFormState, "items" | "fieldErrors">,
    value: string,
  ) => void;
  onLineItemChange: (
    remoteId: string,
    field: keyof Omit<BillingLineItemFormState, "fieldErrors">,
    value: string,
  ) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (remoteId: string) => void;
  onSubmit: () => Promise<void>;
};
