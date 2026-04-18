import {
  RunMoneyAccountBalanceReconciliationWorkflowInput,
  RunMoneyAccountBalanceReconciliationWorkflowResult,
} from "../types/moneyAccountBalanceReconciliation.types";

export interface RunMoneyAccountBalanceReconciliationWorkflowUseCase {
  execute(
    payload: RunMoneyAccountBalanceReconciliationWorkflowInput,
  ): Promise<RunMoneyAccountBalanceReconciliationWorkflowResult>;
}
