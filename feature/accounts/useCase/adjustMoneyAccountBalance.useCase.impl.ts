import {
  AdjustMoneyAccountBalancePayload,
  MoneyAccountResult,
} from "@/feature/accounts/types/moneyAccount.types";
import { RunMoneyAccountBalanceReconciliationWorkflowUseCase } from "@/feature/accounts/workflow/moneyAccountBalanceReconciliation/useCase/runMoneyAccountBalanceReconciliation.useCase";
import { AdjustMoneyAccountBalanceUseCase } from "./adjustMoneyAccountBalance.useCase";

type CreateAdjustMoneyAccountBalanceUseCaseParams = {
  runMoneyAccountBalanceReconciliationWorkflowUseCase: RunMoneyAccountBalanceReconciliationWorkflowUseCase;
};

export const createAdjustMoneyAccountBalanceUseCase = ({
  runMoneyAccountBalanceReconciliationWorkflowUseCase,
}: CreateAdjustMoneyAccountBalanceUseCaseParams): AdjustMoneyAccountBalanceUseCase => ({
  async execute(
    payload: AdjustMoneyAccountBalancePayload,
  ): Promise<MoneyAccountResult> {
    return runMoneyAccountBalanceReconciliationWorkflowUseCase.execute(payload);
  },
});
