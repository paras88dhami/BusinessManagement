import { MoneyAccount, MoneyAccountType } from "@/feature/accounts/types/moneyAccount.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BillingPaymentViewModelModule,
  RunPostIssuePaymentParams,
  UseBillingPaymentViewModelParams,
  ValidateSettlementAccountForPaidNowParams,
} from "./billingPayment.viewModel";

const mapMoneyAccountToOption = (
  moneyAccount: MoneyAccount,
): {
  remoteId: string;
  label: string;
} => {
  const accountTypeLabel =
    moneyAccount.type === MoneyAccountType.Cash
      ? "Cash"
      : moneyAccount.type === MoneyAccountType.Bank
        ? "Bank"
        : "Wallet";

  return {
    remoteId: moneyAccount.remoteId,
    label: `${moneyAccount.name} (${accountTypeLabel})`,
  };
};

const validateSettlementAccountForPaidNow = ({
  paidNowAmount,
  settlementAccountRemoteId,
}: ValidateSettlementAccountForPaidNowParams): string | null => {
  if (paidNowAmount > 0 && settlementAccountRemoteId.trim().length === 0) {
    return "Money account is required when paid amount is entered.";
  }

  return null;
};

export const useBillingPaymentViewModel = ({
  accountRemoteId,
  accountDisplayNameSnapshot,
  ownerUserRemoteId,
  getMoneyAccountsUseCase,
  payBillingDocumentUseCase,
  onRefresh,
  setErrorMessage,
}: UseBillingPaymentViewModelParams): BillingPaymentViewModelModule => {
  const [availableSettlementAccounts, setAvailableSettlementAccounts] = useState<
    readonly { remoteId: string; label: string }[]
  >([]);

  const loadSettlementAccounts = useCallback(async () => {
    if (!accountRemoteId) {
      setAvailableSettlementAccounts([]);
      return;
    }

    const result = await getMoneyAccountsUseCase.execute(accountRemoteId);
    if (!result.success) {
      setAvailableSettlementAccounts([]);
      return;
    }

    const options = result.value
      .filter((moneyAccount) => moneyAccount.isActive)
      .sort((left, right) => {
        if (left.isPrimary && !right.isPrimary) return -1;
        if (!left.isPrimary && right.isPrimary) return 1;
        return left.name.localeCompare(right.name);
      })
      .map(mapMoneyAccountToOption);

    setAvailableSettlementAccounts(options);
  }, [accountRemoteId, getMoneyAccountsUseCase]);

  useEffect(() => {
    void loadSettlementAccounts();
  }, [loadSettlementAccounts]);

  const runPostIssuePayment = useCallback(
    async ({
      billingDocumentRemoteId,
      documentNumber,
      documentType,
      amount,
      settledAt,
      note,
      settlementAccountRemoteId,
    }: RunPostIssuePaymentParams): Promise<boolean> => {
      if (!accountRemoteId) {
        setErrorMessage(
          "Bill issued, but payment could not be posted because account context is missing.",
        );
        await onRefresh();
        return false;
      }

      if (!ownerUserRemoteId?.trim()) {
        setErrorMessage(
          "Bill issued, but payment could not be posted because user context is missing.",
        );
        await onRefresh();
        return false;
      }

      const selectedSettlementAccount = availableSettlementAccounts.find(
        (account) => account.remoteId === settlementAccountRemoteId.trim(),
      );
      if (!selectedSettlementAccount) {
        setErrorMessage(
          "Bill issued, but selected money account is not available.",
        );
        await onRefresh();
        return false;
      }

      const paymentResult = await payBillingDocumentUseCase.execute({
        billingDocumentRemoteId,
        accountRemoteId,
        accountDisplayNameSnapshot:
          accountDisplayNameSnapshot || "Business Account",
        ownerUserRemoteId: ownerUserRemoteId.trim(),
        settlementMoneyAccountRemoteId: selectedSettlementAccount.remoteId,
        settlementMoneyAccountDisplayNameSnapshot: selectedSettlementAccount.label,
        amount,
        settledAt,
        note,
        documentType,
        documentNumber,
      });

      if (!paymentResult.success) {
        setErrorMessage(
          `Bill issued, but payment processing failed: ${paymentResult.error.message}`,
        );
        await onRefresh();
        return false;
      }

      return true;
    },
    [
      accountDisplayNameSnapshot,
      accountRemoteId,
      availableSettlementAccounts,
      onRefresh,
      ownerUserRemoteId,
      payBillingDocumentUseCase,
      setErrorMessage,
    ],
  );

  return useMemo(
    () => ({
      availableSettlementAccounts,
      validateSettlementAccountForPaidNow,
      runPostIssuePayment,
    }),
    [
      availableSettlementAccounts,
      runPostIssuePayment,
    ],
  );
};
