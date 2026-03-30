import { describe, expect, it, vi } from "vitest";
import { createSaveAccountUseCase } from "@/feature/setting/accounts/accountSelection/useCase/saveAccount.useCase.impl";
import { AccountRepository } from "@/feature/setting/accounts/accountSelection/data/repository/account.repository";
import {
  AccountSelectionErrorType,
  AccountType,
  SaveAccountPayload,
} from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";

const createAccount = (
  payload: SaveAccountPayload,
  overrides: Partial<{
    createdAt: number;
    updatedAt: number;
  }> = {},
) => ({
  remoteId: payload.remoteId,
  ownerUserRemoteId: payload.ownerUserRemoteId,
  accountType: payload.accountType,
  businessType: payload.businessType,
  displayName: payload.displayName,
  currencyCode: payload.currencyCode,
  cityOrLocation: payload.cityOrLocation,
  countryCode: payload.countryCode,
  isActive: payload.isActive,
  isDefault: payload.isDefault,
  createdAt: overrides.createdAt ?? 1,
  updatedAt: overrides.updatedAt ?? 1,
});

describe("saveAccount.useCase", () => {
  it("clears previous default account before saving a new default", async () => {
    const saveAccountMock = vi.fn(async (payload: SaveAccountPayload) => ({
      success: true as const,
      value: createAccount(payload),
    }));
    const getAccountsByOwnerUserRemoteIdMock = vi.fn(async () => ({
      success: true as const,
      value: [
        createAccount(
          {
            remoteId: "existing-default",
            ownerUserRemoteId: "user-1",
            accountType: AccountType.Personal,
            businessType: null,
            displayName: "Old Default",
            currencyCode: null,
            cityOrLocation: null,
            countryCode: null,
            isActive: true,
            isDefault: true,
          },
          { updatedAt: 2 },
        ),
      ],
    }));

    const repository: AccountRepository = {
      saveAccount: saveAccountMock,
      getAccountsByOwnerUserRemoteId: getAccountsByOwnerUserRemoteIdMock,
    };

    const useCase = createSaveAccountUseCase(repository);
    const payload: SaveAccountPayload = {
      remoteId: "new-default",
      ownerUserRemoteId: "user-1",
      accountType: AccountType.Personal,
      businessType: null,
      displayName: "New Default",
      currencyCode: null,
      cityOrLocation: null,
      countryCode: null,
      isActive: true,
      isDefault: true,
    };

    const result = await useCase.execute(payload);

    expect(result.success).toBe(true);
    expect(saveAccountMock).toHaveBeenCalledTimes(2);
    expect(saveAccountMock.mock.calls[0]?.[0]).toMatchObject({
      remoteId: "existing-default",
      isDefault: false,
    });
    expect(saveAccountMock.mock.calls[1]?.[0]).toMatchObject({
      remoteId: "new-default",
      isDefault: true,
    });
  });

  it("validates missing business type for business accounts", async () => {
    const repository: AccountRepository = {
      saveAccount: vi.fn(async () => {
        throw new Error("saveAccount should not be called");
      }),
      getAccountsByOwnerUserRemoteId: vi.fn(async () => {
        throw new Error("getAccountsByOwnerUserRemoteId should not be called");
      }),
    };

    const useCase = createSaveAccountUseCase(repository);
    const result = await useCase.execute({
      remoteId: "business-1",
      ownerUserRemoteId: "user-1",
      accountType: AccountType.Business,
      businessType: null,
      displayName: "Business",
      currencyCode: null,
      cityOrLocation: null,
      countryCode: null,
      isActive: true,
      isDefault: true,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(AccountSelectionErrorType.ValidationError);
    expect(result.error.message).toContain("Business type is required");
  });
});
