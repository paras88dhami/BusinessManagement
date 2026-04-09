import { AccountRepository } from "../data/repository/account.repository";
import { GetAccountByRemoteIdUseCase } from "./getAccountByRemoteId.useCase";

export const createGetAccountByRemoteIdUseCase = (
  accountRepository: AccountRepository,
): GetAccountByRemoteIdUseCase => ({
  async execute(remoteId: string) {
    return accountRepository.getAccountByRemoteId(remoteId);
  },
});
