import {
  MoneyAccount,
  MoneyAccountType,
} from "@/feature/accounts/types/moneyAccount.types";
import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { GetEmiPlanByRemoteIdUseCase } from "@/feature/emiLoans/useCase/getEmiPlanByRemoteId.useCase";
import { PayEmiInstallmentUseCase } from "@/feature/emiLoans/useCase/payEmiInstallment.useCase";
import { useCallback, useState } from "react";
import { buildEmiPlanDetailState } from "./emi.shared";
import { EmiPlanDetailViewModel } from "./emiPlanDetail.viewModel";

const mapMoneyAccountToOption = (moneyAccount: MoneyAccount) => {
  const accountTypeLabel =
    moneyAccount.type === MoneyAccountType.Cash
      ? "Cash"
      : moneyAccount.type === MoneyAccountType.Bank
        ? "Bank"
        : "Wallet";
  const primarySuffix = moneyAccount.isPrimary ? " (Primary)" : "";

  return {
    label: `${moneyAccount.name} | ${accountTypeLabel}${primarySuffix}`,
    value: moneyAccount.remoteId,
  };
};

export const useEmiPlanDetailViewModel = (
  getEmiPlanByRemoteIdUseCase: GetEmiPlanByRemoteIdUseCase,
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase,
  payEmiInstallmentUseCase: PayEmiInstallmentUseCase,
  onChanged: () => void,
): EmiPlanDetailViewModel => {
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [state, setState] = useState<ReturnType<
    typeof buildEmiPlanDetailState
  > | null>(null);
  const [settlementAccountOptions, setSettlementAccountOptions] = useState<
    readonly { label: string; value: string }[]
  >([]);
  const [selectedSettlementAccountRemoteId, setSelectedSettlementAccountRemoteId] =
    useState("");

  const loadPlan = useCallback(
    async (remoteId: string) => {
      setIsLoading(true);
      const result = await getEmiPlanByRemoteIdUseCase.execute(remoteId);

      if (!result.success) {
        setState(null);
        setSettlementAccountOptions([]);
        setSelectedSettlementAccountRemoteId("");
        setErrorMessage(result.error.message);
        setIsLoading(false);
        return;
      }

      const scopeAccountRemoteId =
        result.value.plan.businessAccountRemoteId ??
        result.value.plan.linkedAccountRemoteId;
      const moneyAccountsResult = await getMoneyAccountsUseCase.execute(
        scopeAccountRemoteId,
      );
      const moneyAccountOptions = moneyAccountsResult.success
        ? moneyAccountsResult.value
            .filter((moneyAccount) => moneyAccount.isActive)
            .sort((left, right) => {
              if (left.isPrimary && !right.isPrimary) return -1;
              if (!left.isPrimary && right.isPrimary) return 1;
              return left.name.localeCompare(right.name);
            })
            .map(mapMoneyAccountToOption)
        : [];

      setState(
        buildEmiPlanDetailState(result.value.plan, result.value.installments),
      );
      setSettlementAccountOptions(moneyAccountOptions);
      setSelectedSettlementAccountRemoteId(
        moneyAccountOptions[0]?.value ?? "",
      );
      setErrorMessage(null);
      setIsLoading(false);
    },
    [getEmiPlanByRemoteIdUseCase, getMoneyAccountsUseCase],
  );

  const open = useCallback(
    async (remoteId: string) => {
      setVisible(true);
      await loadPlan(remoteId);
    },
    [loadPlan],
  );

  const close = useCallback(() => {
    setVisible(false);
    setErrorMessage(null);
    setSettlementAccountOptions([]);
    setSelectedSettlementAccountRemoteId("");
  }, []);

  const payInstallment = useCallback(
    async (installmentRemoteId: string) => {
      if (!state) {
        return;
      }

      if (!selectedSettlementAccountRemoteId.trim()) {
        setErrorMessage("Choose a valid active money account.");
        return;
      }

      setIsSubmittingPayment(true);
      const result = await payEmiInstallmentUseCase.execute({
        planRemoteId: state.remoteId,
        installmentRemoteId,
        paidAt: Date.now(),
        selectedSettlementAccountRemoteId,
      });

      if (!result.success) {
        setErrorMessage(result.error.message);
        setIsSubmittingPayment(false);
        return;
      }

      await loadPlan(state.remoteId);
      onChanged();
      setIsSubmittingPayment(false);
    },
    [
      loadPlan,
      onChanged,
      payEmiInstallmentUseCase,
      selectedSettlementAccountRemoteId,
      state,
    ],
  );

  return {
    visible,
    isLoading,
    isSubmittingPayment,
    errorMessage,
    state,
    settlementAccountOptions,
    selectedSettlementAccountRemoteId,
    close,
    open,
    onChangeSettlementAccountRemoteId: setSelectedSettlementAccountRemoteId,
    payInstallment,
  };
};
