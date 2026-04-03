import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { AuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository";
import { AuthSessionErrorType } from "@/feature/session/types/authSession.types";
import { UserManagementRepository } from "@/feature/userManagement/data/repository/userManagement.repository";
import {
    AccountMemberStatus,
    UserManagementErrorType,
} from "@/feature/userManagement/types/userManagement.types";
import { createDeleteAccountMemberUseCase } from "@/feature/userManagement/useCase/deleteAccountMember.useCase.impl";
import { describe, expect, it, vi } from "vitest";

const createAccessibleAccount = (remoteId: string) => ({
  remoteId,
  ownerUserRemoteId: "owner-1",
  accountType: AccountType.Business,
  businessType: null,
  displayName: `Account ${remoteId}`,
  currencyCode: "NPR",
  cityOrLocation: "Kathmandu",
  countryCode: "NP",
  isActive: true,
  isDefault: false,
  createdAt: 1,
  updatedAt: 1,
});

describe("deleteAccountMember.useCase", () => {
  it("deletes member and deactivates credential when no remaining account access exists", async () => {
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
      deleteAccountMemberByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
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
    } as unknown as AuthCredentialRepository;

    const getAccessibleAccountsByUserRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [createAccessibleAccount("account-1")],
      })),
    };

    const useCase = createDeleteAccountMemberUseCase({
      userManagementRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
      authCredentialRepository,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      memberRemoteId: "member-1",
    });

    expect(result.success).toBe(true);
    expect(
      userManagementRepository.deleteAccountMemberByRemoteId,
    ).toHaveBeenCalledWith("member-1");
    expect(
      authCredentialRepository.deactivateAuthCredentialByRemoteId,
    ).toHaveBeenCalledWith("cred-1");
  });

  it("does not deactivate credential when user still has other account access", async () => {
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
      deleteAccountMemberByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as UserManagementRepository;

    const authCredentialRepository = {
      getAuthCredentialByUserRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: AuthSessionErrorType.AuthCredentialNotFound,
          message: "not needed",
        },
      })),
      deactivateAuthCredentialByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as AuthCredentialRepository;

    const getAccessibleAccountsByUserRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [
          createAccessibleAccount("account-1"),
          createAccessibleAccount("account-2"),
        ],
      })),
    };

    const useCase = createDeleteAccountMemberUseCase({
      userManagementRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
      authCredentialRepository,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      memberRemoteId: "member-1",
    });

    expect(result.success).toBe(true);
    expect(
      authCredentialRepository.getAuthCredentialByUserRemoteId,
    ).not.toHaveBeenCalled();
    expect(
      authCredentialRepository.deactivateAuthCredentialByRemoteId,
    ).not.toHaveBeenCalled();
  });

  it("blocks delete when actor lacks manage-staff permission", async () => {
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.view"],
      })),
      getAccountMemberByRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      deleteAccountMemberByRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as unknown as UserManagementRepository;

    const authCredentialRepository = {
      getAuthCredentialByUserRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: AuthSessionErrorType.AuthCredentialNotFound,
          message: "not used",
        },
      })),
      deactivateAuthCredentialByRemoteId: vi.fn(async () => ({
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

    const useCase = createDeleteAccountMemberUseCase({
      userManagementRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
      authCredentialRepository,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "staff-1",
      memberRemoteId: "member-1",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.Forbidden);
    expect(
      userManagementRepository.getAccountMemberByRemoteId,
    ).not.toHaveBeenCalled();
  });

  it("rolls back member deletion when credential deactivation fails", async () => {
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
      deleteAccountMemberByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
      saveAccountMember: vi.fn(async () => ({
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
      })),
      assignUserRole: vi.fn(async () => ({
        success: true as const,
        value: {
          accountRemoteId: "account-1",
          userRemoteId: "staff-1",
          roleRemoteId: "role-staff",
          createdAt: 1,
          updatedAt: 2,
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
        success: false as const,
        error: {
          type: AuthSessionErrorType.DatabaseError,
          message: "credential write failed",
        },
      })),
    } as unknown as AuthCredentialRepository;

    const getAccessibleAccountsByUserRemoteIdUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [createAccessibleAccount("account-1")],
      })),
    };

    const useCase = createDeleteAccountMemberUseCase({
      userManagementRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
      authCredentialRepository,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      memberRemoteId: "member-1",
    });

    expect(result.success).toBe(false);
    expect(userManagementRepository.saveAccountMember).toHaveBeenCalledTimes(1);
    expect(userManagementRepository.assignUserRole).toHaveBeenCalledWith({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      userRemoteId: "staff-1",
      roleRemoteId: "role-staff",
    });
  });
});
