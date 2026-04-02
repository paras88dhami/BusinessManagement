import { describe, expect, it, vi } from "vitest";
import { createGetUserManagementSnapshotUseCase } from "@/feature/setting/accounts/userManagement/useCase/getUserManagementSnapshot.useCase.impl";
import { USER_MANAGEMENT_PERMISSION_SEED } from "@/feature/setting/accounts/userManagement/types/userManagementPermissionSeed.types";
import { USER_MANAGEMENT_DEFAULT_ROLE_TEMPLATES } from "@/feature/setting/accounts/userManagement/types/userManagementDefaultRoles.shared";
import { AccountMemberStatus, UserManagementErrorType } from "@/feature/setting/accounts/userManagement/types/userManagement.types";

const buildPermissionCatalog = () =>
  USER_MANAGEMENT_PERMISSION_SEED.map((permissionSeed) => ({
    code: permissionSeed.code,
    module: permissionSeed.module,
    label: permissionSeed.label,
    description: permissionSeed.description,
  }));

describe("getUserManagementSnapshot use case", () => {
  it("seeds missing business default roles before loading snapshot", async () => {
    const roles = [
      {
        remoteId: "owner-account-1",
        accountRemoteId: "account-1",
        name: "Owner",
        isSystem: true,
        isDefault: true,
        permissionCodes: [],
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const repository: any = {
      ensurePermissionCatalogSeeded: vi.fn(async () => ({ success: true, value: true })),
      ensureDefaultOwnerRoleForAccountUser: vi.fn(async () => ({
        success: true,
        value: { remoteId: "owner-account-1" },
      })),
      getPermissionCatalog: vi.fn(async () => ({
        success: true,
        value: buildPermissionCatalog(),
      })),
      getRolesByAccountRemoteId: vi.fn(async () => ({
        success: true,
        value: [...roles],
      })),
      saveRole: vi.fn(async (payload: any) => {
        const savedRole = {
          remoteId: payload.remoteId,
          accountRemoteId: payload.accountRemoteId,
          name: payload.name,
          isSystem: payload.isSystem ?? false,
          isDefault: payload.isDefault ?? false,
          permissionCodes: payload.permissionCodes,
          createdAt: 1,
          updatedAt: 1,
        };
        roles.push(savedRole);

        return {
          success: true,
          value: savedRole,
        };
      }),
      getAccountMembersWithRoleByAccountRemoteId: vi.fn(async () => ({
        success: true,
        value: [
          {
            remoteId: "member-1",
            accountRemoteId: "account-1",
            userRemoteId: "owner-1",
            status: AccountMemberStatus.Active,
            invitedByUserRemoteId: null,
            joinedAt: 1,
            lastActiveAt: 1,
            createdAt: 1,
            updatedAt: 1,
            fullName: "Owner",
            email: null,
            phone: null,
            roleRemoteId: "owner-account-1",
            roleName: "Owner",
            isAccountOwner: true,
          },
        ],
      })),
      getUserRoleAssignment: vi.fn(async () => ({
        success: true,
        value: { roleRemoteId: "owner-account-1" },
      })),
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true,
        value: buildPermissionCatalog().map((permission) => permission.code),
      })),
    };

    const useCase = createGetUserManagementSnapshotUseCase(repository);

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      userRemoteId: "owner-1",
    });

    expect(result.success).toBe(true);
    expect(repository.saveRole).toHaveBeenCalledTimes(
      USER_MANAGEMENT_DEFAULT_ROLE_TEMPLATES.length,
    );

    for (const defaultRoleTemplate of USER_MANAGEMENT_DEFAULT_ROLE_TEMPLATES) {
      const hasDefaultRole = roles.some(
        (role) => role.name.toLowerCase() === defaultRoleTemplate.name.toLowerCase(),
      );
      expect(hasDefaultRole).toBe(true);
    }
  });

  it("skips creating default roles that already exist by name", async () => {
    const roles = [
      {
        remoteId: "owner-account-1",
        accountRemoteId: "account-1",
        name: "Owner",
        isSystem: true,
        isDefault: true,
        permissionCodes: [],
        createdAt: 1,
        updatedAt: 1,
      },
      {
        remoteId: "custom-manager-role",
        accountRemoteId: "account-1",
        name: "Manager",
        isSystem: false,
        isDefault: false,
        permissionCodes: [],
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const repository: any = {
      ensurePermissionCatalogSeeded: vi.fn(async () => ({ success: true, value: true })),
      ensureDefaultOwnerRoleForAccountUser: vi.fn(async () => ({
        success: true,
        value: { remoteId: "owner-account-1" },
      })),
      getPermissionCatalog: vi.fn(async () => ({
        success: true,
        value: buildPermissionCatalog(),
      })),
      getRolesByAccountRemoteId: vi.fn(async () => ({
        success: true,
        value: [...roles],
      })),
      saveRole: vi.fn(async (payload: any) => {
        const savedRole = {
          remoteId: payload.remoteId,
          accountRemoteId: payload.accountRemoteId,
          name: payload.name,
          isSystem: payload.isSystem ?? false,
          isDefault: payload.isDefault ?? false,
          permissionCodes: payload.permissionCodes,
          createdAt: 1,
          updatedAt: 1,
        };
        roles.push(savedRole);

        return {
          success: true,
          value: savedRole,
        };
      }),
      getAccountMembersWithRoleByAccountRemoteId: vi.fn(async () => ({
        success: true,
        value: [],
      })),
      getUserRoleAssignment: vi.fn(async () => ({
        success: false,
        error: {
          type: UserManagementErrorType.NotFound,
          message: "Not found",
        },
      })),
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true,
        value: buildPermissionCatalog().map((permission) => permission.code),
      })),
    };

    const useCase = createGetUserManagementSnapshotUseCase(repository);

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      userRemoteId: "owner-1",
    });

    expect(result.success).toBe(true);
    expect(repository.saveRole).toHaveBeenCalledTimes(
      USER_MANAGEMENT_DEFAULT_ROLE_TEMPLATES.length - 1,
    );
  });
});
