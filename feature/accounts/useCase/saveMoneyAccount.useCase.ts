import {
  MoneyAccountResult,
  SaveMoneyAccountPayload,
} from "@/feature/accounts/types/moneyAccount.types";

export interface SaveMoneyAccountUseCase {
  execute(payload: SaveMoneyAccountPayload): Promise<MoneyAccountResult>;
}
