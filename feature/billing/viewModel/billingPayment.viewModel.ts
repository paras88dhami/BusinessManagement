import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { BillingDocumentTypeValue } from "@/feature/billing/types/billing.types";
import { PayBillingDocumentUseCase } from "@/feature/billing/useCase/payBillingDocument.useCase";
import { BillingSettlementAccountOption } from "./billing.viewModel";

export type ValidateSettlementAccountForPaidNowParams = {
  paidNowAmount: number;
  settlementAccountRemoteId: string;
};

export type RunPostIssuePaymentParams = {
  billingDocumentRemoteId: string;
  documentNumber: string;
  documentType: BillingDocumentTypeValue;
  amount: number;
  settledAt: number;
  note: string | null;
  settlementAccountRemoteId: string;
};

export type UseBillingPaymentViewModelParams = {
  accountRemoteId: string | null;
  accountDisplayNameSnapshot: string;
  ownerUserRemoteId: string | null;
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase;
  payBillingDocumentUseCase: PayBillingDocumentUseCase;
  onRefresh: () => Promise<void>;
  setErrorMessage: (message: string | null) => void;
};

export type BillingPaymentViewModelModule = {
  availableSettlementAccounts: readonly BillingSettlementAccountOption[];
  validateSettlementAccountForPaidNow: (
    params: ValidateSettlementAccountForPaidNowParams,
  ) => string | null;
  runPostIssuePayment: (params: RunPostIssuePaymentParams) => Promise<boolean>;
};
