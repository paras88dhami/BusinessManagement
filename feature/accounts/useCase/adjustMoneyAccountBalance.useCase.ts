import {
  AdjustMoneyAccountBalancePayload,
  MoneyAccountResult,
} from "@/feature/accounts/types/moneyAccount.types";

export interface AdjustMoneyAccountBalanceUseCase {
  execute(payload: AdjustMoneyAccountBalancePayload): Promise<MoneyAccountResult>;
}
