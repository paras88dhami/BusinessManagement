import {
  RunMoneyAccountOpeningBalanceWorkflowInput,
  RunMoneyAccountOpeningBalanceWorkflowResult,
} from "../types/moneyAccountOpeningBalance.types";

export interface RunMoneyAccountOpeningBalanceWorkflowUseCase {
  execute(
    payload: RunMoneyAccountOpeningBalanceWorkflowInput,
  ): Promise<RunMoneyAccountOpeningBalanceWorkflowResult>;
}
