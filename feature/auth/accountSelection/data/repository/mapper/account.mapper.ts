import { Account } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { AccountModel } from "../../dataSource/db/account.model";
import { TaxModeValue } from "@/shared/types/regionalFinance.types";

export const mapAccountModelToDomain = async (
  model: AccountModel,
): Promise<Account> => {
  return {
    remoteId: model.remoteId,
    ownerUserRemoteId: model.ownerUserRemoteId,
    accountType: model.accountType,
    businessType: model.businessType,
    displayName: model.displayName,
    currencyCode: model.currencyCode,
    cityOrLocation: model.cityOrLocation,
    countryCode: model.countryCode,
    defaultTaxRatePercent: model.defaultTaxRatePercent,
    defaultTaxMode: model.defaultTaxMode as TaxModeValue | null,
    isActive: model.isActive,
    isDefault: model.isDefault,
    createdAt: model.createdAt.getTime(),
    updatedAt: model.updatedAt.getTime(),
  };
};
