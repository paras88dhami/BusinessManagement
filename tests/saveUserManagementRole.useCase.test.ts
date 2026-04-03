import { describe, expect, it, vi } from "vitest";
import { UserManagementRepository } from "@/feature/userManagement/data/repository/userManagement.repository";
import { createSaveUserManagementRoleUseCase } from "@/feature/userManagement/useCase/saveUserManagementRole.useCase.impl";
import { UserManagementErrorType } from "@/feature/userManagement/types/userManagement.types";

describe("saveUserManagementRole.useCase", () => {
  it("saves role when actor has manage-roles permission", async () => {
    const repository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_roles"],
      })),
      saveRole: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "role-manager",
          accountRemoteId: "account-1",
          name: "Manager",
          isSystem: false,
          isDefault: false,
          permissionCodes: ["ledger.view"],
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    } as unknown as UserManagementRepository;

    const useCase = createSaveUserManagementRoleUseCase(repository);

    const result = await useCase.execute({
      remoteId: null,
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      name: "Manager",
      permissionCodes: ["ledger.view"],
      isSystem: null,
      isDefault: null,
    });

    expect(result.success).toBe(true);
    expect(repository.saveRole).toHaveBeenCalledTimes(1);
  });

  it("blocks save when actor lacks manage-roles permission", async () => {
    const repository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.view"],
      })),
      saveRole: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as unknown as UserManagementRepository;

    const useCase = createSaveUserManagementRoleUseCase(repository);

    const result = await useCase.execute({
      remoteId: null,
      accountRemoteId: "account-1",
      actorUserRemoteId: "staff-1",
      name: "Manager",
      permissionCodes: ["ledger.view"],
      isSystem: null,
      isDefault: null,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.Forbidden);
    expect(repository.saveRole).not.toHaveBeenCalled();
  });

  it("returns validation error when actor context is missing", async () => {
    const repository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_roles"],
      })),
      saveRole: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as UserManagementRepository;

    const useCase = createSaveUserManagementRoleUseCase(repository);

    const result = await useCase.execute({
      remoteId: null,
      accountRemoteId: "account-1",
      actorUserRemoteId: "   ",
      name: "Manager",
      permissionCodes: ["ledger.view"],
      isSystem: null,
      isDefault: null,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.ValidationError);
    expect(repository.getPermissionCodesByAccountUser).not.toHaveBeenCalled();
    expect(repository.saveRole).not.toHaveBeenCalled();
  });
});
