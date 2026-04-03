import { AccountRepository } from "@/feature/auth/accountSelection/data/repository/account.repository";
import {
    AccountSelectionErrorType,
    AccountType,
} from "@/feature/auth/accountSelection/types/accountSelection.types";
import { createGetAccessibleAccountsByUserRemoteIdUseCase } from "@/feature/auth/accountSelection/useCase/getAccessibleAccountsByUserRemoteId.useCase.impl";
import { UserManagementRepository } from "@/feature/userManagement/data/repository/userManagement.repository";
import { UserManagementErrorType } from "@/feature/userManagement/types/userManagement.types";
import { describe, expect, it, vi } from "vitest";

const createAccount = (
  remoteId: string,
  overrides: Partial<{
    isActive: boolean;
    isDefault: boolean;
    updatedAt: number;
  }> = {},
) => ({
  remoteId,
  ownerUserRemoteId: "owner-1",
  accountType: AccountType.Business,
  businessType: null,
  displayName: `Account ${remoteId}`,
  currencyCode: "NPR",
  cityOrLocation: "Kathmandu",
  countryCode: "NP",
  isActive: overrides.isActive ?? true,
  isDefault: overrides.isDefault ?? false,
  createdAt: 1,
  updatedAt: overrides.updatedAt ?? 1,
});

describe("getAccessibleAccountsByUserRemoteId.useCase", () => {
  it("merges owner and active member accounts without duplicates", async () => {
    const accountRepository: AccountRepository = {
      saveAccount: vi.fn(async () => {
        throw new Error("not used");
      }),
      getAccountByRemoteId: vi.fn(async () => {
        throw new Error("not used");
      }),
      getAccountsByOwnerUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          createAccount("account-owner-default", {
            isDefault: true,
            updatedAt: 2,
          }),
          createAccount("account-shared", { updatedAt: 1 }),
        ],
      })),
      getAccountsByRemoteIds: vi.fn(async () => ({
        success: true as const,
        value: [
          createAccount("account-shared", { updatedAt: 1 }),
          createAccount("account-member-only", { updatedAt: 3 }),
          createAccount("account-inactive", { isActive: false, updatedAt: 4 }),
        ],
      })),
    };

    const userManagementRepository = {
      getActiveMemberAccountRemoteIdsByUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: ["account-shared", "account-member-only", "account-inactive"],
      })),
    } as unknown as UserManagementRepository;

    const useCase = createGetAccessibleAccountsByUserRemoteIdUseCase({
      accountRepository,
      userManagementRepository,
    });

    const result = await useCase.execute("user-1");

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.value.map((account) => account.remoteId)).toEqual([
      "account-owner-default",
      "account-member-only",
      "account-shared",
    ]);
  });

  it("maps user-management validation error to account-selection error", async () => {
    const accountRepository: AccountRepository = {
      saveAccount: vi.fn(async () => {
        throw new Error("not used");
      }),
      getAccountByRemoteId: vi.fn(async () => {
        throw new Error("not used");
      }),
      getAccountsByOwnerUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
      getAccountsByRemoteIds: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const userManagementRepository = {
      getActiveMemberAccountRemoteIdsByUserRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: UserManagementErrorType.ValidationError,
          message: "user id missing",
        },
      })),
    } as unknown as UserManagementRepository;

    const useCase = createGetAccessibleAccountsByUserRemoteIdUseCase({
      accountRepository,
      userManagementRepository,
    });

    const result = await useCase.execute("user-1");

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(AccountSelectionErrorType.ValidationError);
    expect(result.error.message).toBe("user id missing");
  });
});
