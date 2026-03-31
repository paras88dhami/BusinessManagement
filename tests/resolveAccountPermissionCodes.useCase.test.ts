import { describe, expect, it, vi } from "vitest";
import { createResolveAccountPermissionCodesUseCase } from "@/feature/setting/accounts/userManagement/useCase/resolveAccountPermissionCodes.useCase.impl";
import { UserManagementRepository } from "@/feature/setting/accounts/userManagement/data/repository/userManagement.repository";
import { UserManagementErrorType } from "@/feature/setting/accounts/userManagement/types/userManagement.types";

describe("resolveAccountPermissionCodes.useCase", () => {
  it("ensures owner role before resolving permission codes", async () => {
    const ensureDefaultOwnerRoleForAccountUser = vi.fn(async () => ({
      success: true as const,
      value: {
        remoteId: "owner-account-1",
        accountRemoteId: "account-1",
        name: "Owner",
        isSystem: true,
        isDefault: true,
        permissionCodes: ["ledger.view"],
        createdAt: 1,
        updatedAt: 1,
      },
    }));

    const getPermissionCodesByAccountUser = vi.fn(async () => ({
      success: true as const,
      value: ["ledger.view", "pos.view"],
    }));

    const repository = {
      ensureDefaultOwnerRoleForAccountUser,
      getPermissionCodesByAccountUser,
    } as unknown as UserManagementRepository;

    const useCase = createResolveAccountPermissionCodesUseCase(repository);

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      userRemoteId: "user-1",
    });

    expect(result.success).toBe(true);
    expect(ensureDefaultOwnerRoleForAccountUser).toHaveBeenCalledTimes(1);
    expect(getPermissionCodesByAccountUser).toHaveBeenCalledTimes(1);

    if (!result.success) {
      return;
    }

    expect(result.value).toEqual(["ledger.view", "pos.view"]);
  });

  it("returns owner bootstrap errors directly", async () => {
    const repository = {
      ensureDefaultOwnerRoleForAccountUser: vi.fn(async () => ({
        success: false as const,
        error: {
          type: UserManagementErrorType.ValidationError,
          message: "account missing",
        },
      })),
      getPermissionCodesByAccountUser: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as unknown as UserManagementRepository;

    const useCase = createResolveAccountPermissionCodesUseCase(repository);

    const result = await useCase.execute({
      accountRemoteId: "",
      userRemoteId: "user-1",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.ValidationError);
    expect(repository.getPermissionCodesByAccountUser).not.toHaveBeenCalled();
  });
});
