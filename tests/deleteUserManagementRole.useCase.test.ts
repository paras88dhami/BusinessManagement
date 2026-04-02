import { describe, expect, it, vi } from "vitest";
import { UserManagementRepository } from "@/feature/setting/accounts/userManagement/data/repository/userManagement.repository";
import { createDeleteUserManagementRoleUseCase } from "@/feature/setting/accounts/userManagement/useCase/deleteUserManagementRole.useCase.impl";
import { UserManagementErrorType } from "@/feature/setting/accounts/userManagement/types/userManagement.types";

describe("deleteUserManagementRole.useCase", () => {
  it("deletes role when actor has manage-role permission", async () => {
    const repository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_roles"],
      })),
      getRolesByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            remoteId: "role-manager",
            accountRemoteId: "account-1",
            name: "Manager",
            isSystem: false,
            isDefault: false,
            permissionCodes: ["ledger.view"],
            createdAt: 1,
            updatedAt: 1,
          },
        ],
      })),
      deleteRoleByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as UserManagementRepository;

    const useCase = createDeleteUserManagementRoleUseCase(repository);

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      roleRemoteId: "role-manager",
    });

    expect(result.success).toBe(true);
    expect(repository.deleteRoleByRemoteId).toHaveBeenCalledWith("role-manager");
  });

  it("returns validation error when role is not part of account", async () => {
    const repository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_roles"],
      })),
      getRolesByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
      deleteRoleByRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as unknown as UserManagementRepository;

    const useCase = createDeleteUserManagementRoleUseCase(repository);

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      roleRemoteId: "role-missing",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.ValidationError);
    expect(repository.deleteRoleByRemoteId).not.toHaveBeenCalled();
  });
});

