import { MoneyAccountModel } from "@/feature/accounts/data/dataSource/db/moneyAccount.model";
import { MoneyAccount } from "@/feature/accounts/types/moneyAccount.types";

export const mapMoneyAccountModelToDomain = async (
  model: MoneyAccountModel,
): Promise<MoneyAccount> => {
  return {
    remoteId: model.remoteId,
    ownerUserRemoteId: model.ownerUserRemoteId,
    scopeAccountRemoteId: model.scopeAccountRemoteId,
    name: model.name,
    type: model.accountType,
    currentBalance: model.currentBalance,
    description: model.description,
    currencyCode: model.currencyCode,
    isPrimary: model.isPrimary,
    isActive: model.isActive,
    createdAt: model.createdAt.getTime(),
    updatedAt: model.updatedAt.getTime(),
  };
};
