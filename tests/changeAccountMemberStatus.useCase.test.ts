import { describe, expect, it, vi } from "vitest";
import { AuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository";
import { UserManagementRepository } from "@/feature/setting/accounts/userManagement/data/repository/userManagement.repository";
import { createChangeAccountMemberStatusUseCase } from "@/feature/setting/accounts/userManagement/useCase/changeAccountMemberStatus.useCase.impl";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import {
  AccountMemberStatus,
  UserManagementErrorType,
} from "@/feature/setting/accounts/userManagement/types/userManagement.types";

describe("changeAccountMemberStatus.useCase", () => {
  it("blocks status change when actor lacks manage-staff permission", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.view"],
      })),
      getAccountOwnerUserRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      getAccountMemberByRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      saveAccountMember: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as unknown as UserManagementRepository;

    const authCredentialRepository = {
      getAuthCredentialByUserRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "AUTH_CREDENTIAL_NOT_FOUND",
          message: "not used",
        },
      })),
      deactivateAuthCredentialByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
      saveAuthCredential: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as AuthCredentialRepository;
    const getAccessibleAccountsByUserRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createChangeAccountMemberStatusUseCase({
      userManagementRepository,
      authCredentialRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "staff-1",
      memberRemoteId: "member-1",
      status: AccountMemberStatus.Inactive,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.Forbidden);
    expect(userManagementRepository.getAccountOwnerUserRemoteId).not.toHaveBeenCalled();
  });

  it("updates status when actor has manage-staff permission", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff"],
      })),
      getAccountOwnerUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: "owner-1",
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
      saveAccountMember: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "member-1",
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          status: AccountMemberStatus.Inactive,
          invitedByUserRemoteId: "owner-1",
          joinedAt: 1,
          lastActiveAt: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    } as unknown as UserManagementRepository;

    const authCredentialRepository = {
      getAuthCredentialByUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "cred-1",
          userRemoteId: "staff-1",
          loginId: "9800000000",
          credentialType: "password",
          passwordHash: "hash",
          passwordSalt: "salt",
          hint: null,
          lastLoginAt: null,
          isActive: true,
          failedAttemptCount: 0,
          lockoutUntil: null,
          lastFailedLoginAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      deactivateAuthCredentialByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
      saveAuthCredential: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "cred-1",
          userRemoteId: "staff-1",
          loginId: "9800000000",
          credentialType: "password",
          passwordHash: "hash",
          passwordSalt: "salt",
          hint: null,
          lastLoginAt: null,
          isActive: true,
          failedAttemptCount: 0,
          lockoutUntil: null,
          lastFailedLoginAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    } as unknown as AuthCredentialRepository;
    const getAccessibleAccountsByUserRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createChangeAccountMemberStatusUseCase({
      userManagementRepository,
      authCredentialRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      memberRemoteId: "member-1",
      status: AccountMemberStatus.Inactive,
    });

    expect(result.success).toBe(true);
    expect(userManagementRepository.saveAccountMember).toHaveBeenCalledTimes(1);
    expect(authCredentialRepository.deactivateAuthCredentialByRemoteId).toHaveBeenCalledWith(
      "cred-1",
    );
  });

  it("keeps credential active when user still has access to another account", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff"],
      })),
      getAccountOwnerUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: "owner-1",
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
      saveAccountMember: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "member-1",
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          status: AccountMemberStatus.Inactive,
          invitedByUserRemoteId: "owner-1",
          joinedAt: 1,
          lastActiveAt: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    } as unknown as UserManagementRepository;

    const authCredentialRepository = {
      getAuthCredentialByUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "cred-1",
          userRemoteId: "staff-1",
          loginId: "9800000000",
          credentialType: "password",
          passwordHash: "hash",
          passwordSalt: "salt",
          hint: null,
          lastLoginAt: null,
          isActive: true,
          failedAttemptCount: 0,
          lockoutUntil: null,
          lastFailedLoginAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      deactivateAuthCredentialByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
      saveAuthCredential: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as AuthCredentialRepository;

    const getAccessibleAccountsByUserRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [
          {
            remoteId: "account-2",
            ownerUserRemoteId: "owner-2",
            accountType: AccountType.Business,
            businessType: null,
            displayName: "Other account",
            currencyCode: "NPR",
            cityOrLocation: "Kathmandu",
            countryCode: "NP",
            isActive: true,
            isDefault: false,
            createdAt: 1,
            updatedAt: 1,
          },
        ],
      })),
    };

    const useCase = createChangeAccountMemberStatusUseCase({
      userManagementRepository,
      authCredentialRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      memberRemoteId: "member-1",
      status: AccountMemberStatus.Inactive,
    });

    expect(result.success).toBe(true);
    expect(authCredentialRepository.deactivateAuthCredentialByRemoteId).not.toHaveBeenCalled();
  });

  it("rolls back member status when credential update fails", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff"],
      })),
      getAccountOwnerUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: "owner-1",
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
      saveAccountMember: vi
        .fn()
        .mockResolvedValueOnce({
          success: true as const,
          value: {
            remoteId: "member-1",
            accountRemoteId: "account-1",
            userRemoteId: "staff-1",
            status: AccountMemberStatus.Inactive,
            invitedByUserRemoteId: "owner-1",
            joinedAt: 1,
            lastActiveAt: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        })
        .mockResolvedValueOnce({
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
            updatedAt: 2,
          },
        }),
    } as unknown as UserManagementRepository;

    const authCredentialRepository = {
      getAuthCredentialByUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "cred-1",
          userRemoteId: "staff-1",
          loginId: "9800000000",
          credentialType: "password",
          passwordHash: "hash",
          passwordSalt: "salt",
          hint: null,
          lastLoginAt: null,
          isActive: true,
          failedAttemptCount: 0,
          lockoutUntil: null,
          lastFailedLoginAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      deactivateAuthCredentialByRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "DATABASE_ERROR",
          message: "credential write failed",
        },
      })),
      saveAuthCredential: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as AuthCredentialRepository;

    const getAccessibleAccountsByUserRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [],
      })),
    };

    const useCase = createChangeAccountMemberStatusUseCase({
      userManagementRepository,
      authCredentialRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      memberRemoteId: "member-1",
      status: AccountMemberStatus.Inactive,
    });

    expect(result.success).toBe(false);
    expect(userManagementRepository.saveAccountMember).toHaveBeenCalledTimes(2);
  });
});
