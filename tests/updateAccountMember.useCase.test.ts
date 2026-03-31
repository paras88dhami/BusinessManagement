import { describe, expect, it, vi } from "vitest";
import { GetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase";
import { SaveAuthUserUseCase } from "@/feature/session/useCase/saveAuthUser.useCase";
import { UserManagementRepository } from "@/feature/setting/accounts/userManagement/data/repository/userManagement.repository";
import { createUpdateAccountMemberUseCase } from "@/feature/setting/accounts/userManagement/useCase/updateAccountMember.useCase.impl";
import {
  AccountMemberStatus,
  UserManagementErrorType,
} from "@/feature/setting/accounts/userManagement/types/userManagement.types";

describe("updateAccountMember.useCase", () => {
  it("blocks update when actor lacks manage-staff permission", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.view"],
      })),
      getAccountMemberByRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      getUserRoleAssignment: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      assignUserRole: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      getAccountMembersWithRoleByAccountRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as unknown as UserManagementRepository;

    const getAuthUserByRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as GetAuthUserByRemoteIdUseCase;

    const saveAuthUserUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as SaveAuthUserUseCase;

    const useCase = createUpdateAccountMemberUseCase({
      userManagementRepository,
      getAuthUserByRemoteIdUseCase,
      saveAuthUserUseCase,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "staff-1",
      memberRemoteId: "member-1",
      fullName: "Staff User",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.Forbidden);
    expect(userManagementRepository.getAccountMemberByRemoteId).not.toHaveBeenCalled();
  });

  it("updates profile without role reassignment when role is unchanged", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff"],
      })),
      getAccountMemberByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "member-1",
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          status: AccountMemberStatus.Active,
          invitedByUserRemoteId: "owner-1",
          joinedAt: 1,
          lastActiveAt: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      getUserRoleAssignment: vi.fn(async () => ({
        success: true as const,
        value: {
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          roleRemoteId: "role-staff",
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      assignUserRole: vi.fn(async () => ({
        success: true as const,
        value: {
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          roleRemoteId: "role-staff",
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      getAccountMembersWithRoleByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            remoteId: "member-1",
            accountRemoteId: "account-1",
            userRemoteId: "staff-1",
            status: AccountMemberStatus.Active,
            invitedByUserRemoteId: "owner-1",
            joinedAt: 1,
            lastActiveAt: 1,
            createdAt: 1,
            updatedAt: 1,
            fullName: "Updated Name",
            email: "staff@elekha.com",
            phone: "9800000000",
            roleRemoteId: "role-staff",
            roleName: "Staff",
            isAccountOwner: false,
          },
        ],
      })),
    } as unknown as UserManagementRepository;

    const getAuthUserByRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "staff-1",
          fullName: "Staff User",
          email: "staff@elekha.com",
          phone: "9800000000",
          authProvider: null,
          profileImageUrl: null,
          preferredLanguage: null,
          isEmailVerified: false,
          isPhoneVerified: false,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    } as unknown as GetAuthUserByRemoteIdUseCase;

    const saveAuthUserUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "staff-1",
          fullName: "Updated Name",
          email: "staff@elekha.com",
          phone: "9800000000",
          authProvider: null,
          profileImageUrl: null,
          preferredLanguage: null,
          isEmailVerified: false,
          isPhoneVerified: false,
          createdAt: 1,
          updatedAt: 2,
        },
      })),
    } as unknown as SaveAuthUserUseCase;

    const useCase = createUpdateAccountMemberUseCase({
      userManagementRepository,
      getAuthUserByRemoteIdUseCase,
      saveAuthUserUseCase,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "manager-1",
      memberRemoteId: "member-1",
      fullName: "Updated Name",
      roleRemoteId: "role-staff",
    });

    expect(result.success).toBe(true);
    expect(saveAuthUserUseCase.execute).toHaveBeenCalledTimes(1);
    expect(userManagementRepository.assignUserRole).not.toHaveBeenCalled();
  });

  it("rolls back profile changes when role assignment fails", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff", "user_management.assign_role"],
      })),
      getAccountMemberByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "member-1",
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          status: AccountMemberStatus.Active,
          invitedByUserRemoteId: "owner-1",
          joinedAt: 1,
          lastActiveAt: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      getUserRoleAssignment: vi.fn(async () => ({
        success: true as const,
        value: {
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          roleRemoteId: "role-old",
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      assignUserRole: vi.fn(async () => ({
        success: false as const,
        error: {
          type: UserManagementErrorType.Conflict,
          message: "role conflict",
        },
      })),
      getAccountMembersWithRoleByAccountRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as unknown as UserManagementRepository;

    const getAuthUserByRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "staff-1",
          fullName: "Staff User",
          email: "staff@elekha.com",
          phone: "9800000000",
          authProvider: null,
          profileImageUrl: null,
          preferredLanguage: null,
          isEmailVerified: false,
          isPhoneVerified: false,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    } as unknown as GetAuthUserByRemoteIdUseCase;

    const saveAuthUserUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce({
          success: true as const,
          value: {
            remoteId: "staff-1",
            fullName: "Updated Name",
            email: "updated@elekha.com",
            phone: "9800000000",
            authProvider: null,
            profileImageUrl: null,
            preferredLanguage: null,
            isEmailVerified: false,
            isPhoneVerified: false,
            createdAt: 1,
            updatedAt: 2,
          },
        })
        .mockResolvedValueOnce({
          success: true as const,
          value: {
            remoteId: "staff-1",
            fullName: "Staff User",
            email: "staff@elekha.com",
            phone: "9800000000",
            authProvider: null,
            profileImageUrl: null,
            preferredLanguage: null,
            isEmailVerified: false,
            isPhoneVerified: false,
            createdAt: 1,
            updatedAt: 3,
          },
        }),
    } as unknown as SaveAuthUserUseCase;

    const useCase = createUpdateAccountMemberUseCase({
      userManagementRepository,
      getAuthUserByRemoteIdUseCase,
      saveAuthUserUseCase,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "manager-1",
      memberRemoteId: "member-1",
      fullName: "Updated Name",
      email: "updated@elekha.com",
      roleRemoteId: "role-new",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.Conflict);
    expect(saveAuthUserUseCase.execute).toHaveBeenCalledTimes(2);
    expect(saveAuthUserUseCase.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        fullName: "Updated Name",
        email: "updated@elekha.com",
      }),
    );
    expect(saveAuthUserUseCase.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        fullName: "Staff User",
        email: "staff@elekha.com",
      }),
    );
  });
});
