import {
  MoneyAccountsResult,
  MoneyAccountValidationError,
} from "@/feature/accounts/types/moneyAccount.types";
import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
import { GetMoneyAccountsUseCase } from "./getMoneyAccounts.useCase";

export const createGetMoneyAccountsUseCase = (
  repository: MoneyAccountRepository,
): GetMoneyAccountsUseCase => ({
  async execute(scopeAccountRemoteId: string): Promise<MoneyAccountsResult> {
    const normalizedScopeAccountRemoteId = scopeAccountRemoteId.trim();

    if (!normalizedScopeAccountRemoteId) {
      return {
        success: false,
        error: MoneyAccountValidationError("Scope account is required."),
      };
    }

    return repository.getMoneyAccountsByScopeAccountRemoteId(
      normalizedScopeAccountRemoteId,
    );
  },
});
