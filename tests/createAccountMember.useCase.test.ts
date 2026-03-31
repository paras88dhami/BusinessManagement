import { describe, expect, it, vi } from "vitest";
import { AuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository";
import { AuthUserRepository } from "@/feature/session/data/repository/authUser.repository";
import { AuthSessionErrorType } from "@/feature/session/types/authSession.types";
import {
  AccountMemberStatus,
  UserManagementErrorType,
} from "@/feature/setting/accounts/userManagement/types/userManagement.types";

vi.mock("expo-crypto", () => ({
  randomUUID: () => "mocked-uuid",
}));

const loadCreateAccountMemberUseCase = async () => {
  const module = await import(
    "@/feature/setting/accounts/userManagement/useCase/createAccountMember.useCase.impl"
  );
  return module.createCreateAccountMemberUseCase;
};

describe("createAccountMember.useCase", () => {
  it("reuses existing identity by phone and reactivates credential", async () => {
    const createCreateAccountMemberUseCase = await loadCreateAccountMemberUseCase();
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff", "user_management.assign_role"],
      })),
      getAccountMemberByAccountAndUser: vi.fn(async () => ({
        success: false as const,
        error: {
          type: UserManagementErrorType.NotFound,
          message: "not found",
        },
      })),
      saveAccountMember: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "member-1",
          accountRemoteId: "account-1",
          userRemoteId: "user-existing",
          status: AccountMemberStatus.Active,
          invitedByUserRemoteId: "owner-1",
          joinedAt: 1,
          lastActiveAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      assignUserRole: vi.fn(async () => ({
        success: true as const,
        value: {
          accountRemoteId: "account-1",
          userRemoteId: "user-existing",
          roleRemoteId: "role-manager",
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
            userRemoteId: "user-existing",
            status: AccountMemberStatus.Active,
            invitedByUserRemoteId: "owner-1",
            joinedAt: 1,
            lastActiveAt: null,
            createdAt: 1,
            updatedAt: 1,
            fullName: "Existing User",
            email: "existing@elekha.com",
            phone: "9800000000",
            roleRemoteId: "role-manager",
            roleName: "Manager",
            isAccountOwner: false,
          },
        ],
      })),
    } as any;

    const saveAuthUserUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "user-existing",
          fullName: "Existing User",
          email: "existing@elekha.com",
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
    };

    const saveAuthCredentialUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "cred-existing",
          userRemoteId: "user-existing",
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
    };

    const authUserRepository = {
      getAuthUserByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "user-existing",
          fullName: "Existing User",
          email: "existing@elekha.com",
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
      deleteAuthUserByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as AuthUserRepository;

    const authCredentialRepository = {
      getAuthCredentialByLoginId: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "cred-existing",
          userRemoteId: "user-existing",
          loginId: "9800000000",
          credentialType: "password",
          passwordHash: "hash",
          passwordSalt: "salt",
          hint: null,
          lastLoginAt: null,
          isActive: false,
          failedAttemptCount: 0,
          lockoutUntil: null,
          lastFailedLoginAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      deleteAuthCredentialByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as AuthCredentialRepository;

    const passwordHashService = {
      generateSalt: vi.fn(async () => "salt"),
      hash: vi.fn(async () => "hash"),
      compare: vi.fn(async () => true),
      needsRehash: vi.fn(() => false),
    };

    const useCase = createCreateAccountMemberUseCase({
      userManagementRepository,
      saveAuthUserUseCase: saveAuthUserUseCase as any,
      saveAuthCredentialUseCase: saveAuthCredentialUseCase as any,
      authUserRepository,
      authCredentialRepository,
      passwordHashService: passwordHashService as any,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      fullName: "New Name",
      email: "new@elekha.com",
      phone: "9800000000",
      password: "password123",
      roleRemoteId: "role-manager",
    });

    expect(result.success).toBe(true);
    expect(authCredentialRepository.getAuthCredentialByLoginId).toHaveBeenCalledTimes(1);
    expect(saveAuthCredentialUseCase.execute).toHaveBeenCalledTimes(1);
    expect(authUserRepository.deleteAuthUserByRemoteId).not.toHaveBeenCalled();
    expect(authCredentialRepository.deleteAuthCredentialByRemoteId).not.toHaveBeenCalled();
  });

  it("returns conflict when identity already belongs to selected account", async () => {
    const createCreateAccountMemberUseCase = await loadCreateAccountMemberUseCase();
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff", "user_management.assign_role"],
      })),
      getAccountMemberByAccountAndUser: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "member-1",
          accountRemoteId: "account-1",
          userRemoteId: "user-existing",
          status: AccountMemberStatus.Active,
          invitedByUserRemoteId: "owner-1",
          joinedAt: 1,
          lastActiveAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      saveAccountMember: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as any;

    const useCase = createCreateAccountMemberUseCase({
      userManagementRepository,
      saveAuthUserUseCase: {
        execute: vi.fn(async () => ({ success: true as const, value: true })),
      } as any,
      saveAuthCredentialUseCase: {
        execute: vi.fn(async () => ({ success: true as const, value: true })),
      } as any,
      authUserRepository: {
        getAuthUserByRemoteId: vi.fn(async () => ({
          success: true as const,
          value: {
            remoteId: "user-existing",
            fullName: "Existing User",
            email: "existing@elekha.com",
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
        deleteAuthUserByRemoteId: vi.fn(async () => ({
          success: true as const,
          value: true,
        })),
      } as any,
      authCredentialRepository: {
        getAuthCredentialByLoginId: vi.fn(async () => ({
          success: true as const,
          value: {
            remoteId: "cred-existing",
            userRemoteId: "user-existing",
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
        deleteAuthCredentialByRemoteId: vi.fn(async () => ({
          success: true as const,
          value: true,
        })),
      } as any,
      passwordHashService: {
        generateSalt: vi.fn(async () => "salt"),
        hash: vi.fn(async () => "hash"),
        compare: vi.fn(async () => true),
        needsRehash: vi.fn(() => false),
      } as any,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      fullName: "User",
      email: "user@elekha.com",
      phone: "9800000000",
      password: "password123",
      roleRemoteId: "role-manager",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.Conflict);
  });

  it("blocks create when actor lacks assign-role permission", async () => {
    const createCreateAccountMemberUseCase = await loadCreateAccountMemberUseCase();
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff"],
      })),
      getAccountMemberByAccountAndUser: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      saveAccountMember: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      assignUserRole: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      getAccountMembersWithRoleByAccountRemoteId: vi.fn(async () => {
        throw new Error("should not be called");
      }),
    } as any;

    const useCase = createCreateAccountMemberUseCase({
      userManagementRepository,
      saveAuthUserUseCase: {
        execute: vi.fn(async () => ({ success: true as const, value: true })),
      } as any,
      saveAuthCredentialUseCase: {
        execute: vi.fn(async () => ({ success: true as const, value: true })),
      } as any,
      authUserRepository: {
        getAuthUserByRemoteId: vi.fn(async () => ({
          success: true as const,
          value: {
            remoteId: "user-1",
            fullName: "User 1",
            email: null,
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
        deleteAuthUserByRemoteId: vi.fn(async () => ({
          success: true as const,
          value: true,
        })),
      } as any,
      authCredentialRepository: {
        getAuthCredentialByLoginId: vi.fn(async () => ({
          success: false as const,
          error: {
            type: "AUTH_CREDENTIAL_NOT_FOUND",
            message: "not found",
          },
        })),
        deleteAuthCredentialByRemoteId: vi.fn(async () => ({
          success: true as const,
          value: true,
        })),
      } as any,
      passwordHashService: {
        generateSalt: vi.fn(async () => "salt"),
        hash: vi.fn(async () => "hash"),
        compare: vi.fn(async () => true),
        needsRehash: vi.fn(() => false),
      } as any,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "staff-1",
      fullName: "User",
      email: null,
      phone: "9800000000",
      password: "password123",
      roleRemoteId: "role-staff",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(UserManagementErrorType.Forbidden);
    expect(userManagementRepository.getAccountMemberByAccountAndUser).not.toHaveBeenCalled();
  });

  it("rolls back member record when final member snapshot read fails", async () => {
    const createCreateAccountMemberUseCase = await loadCreateAccountMemberUseCase();
    const userManagementRepository = {
      getPermissionCodesByAccountUser: vi.fn(async () => ({
        success: true as const,
        value: ["user_management.manage_staff", "user_management.assign_role"],
      })),
      getAccountMemberByAccountAndUser: vi.fn(async () => ({
        success: false as const,
        error: {
          type: UserManagementErrorType.NotFound,
          message: "not found",
        },
      })),
      saveAccountMember: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "member-1",
          accountRemoteId: "account-1",
          userRemoteId: "user-new",
          status: AccountMemberStatus.Active,
          invitedByUserRemoteId: "owner-1",
          joinedAt: 1,
          lastActiveAt: null,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      assignUserRole: vi.fn(async () => ({
        success: true as const,
        value: {
          accountRemoteId: "account-1",
          userRemoteId: "user-new",
          roleRemoteId: "role-staff",
          createdAt: 1,
          updatedAt: 1,
        },
      })),
      getAccountMembersWithRoleByAccountRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: UserManagementErrorType.DatabaseError,
          message: "database read failed",
        },
      })),
      deleteAccountMemberByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as any;

    const saveAuthUserUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "user-new",
          fullName: "New User",
          email: "new@elekha.com",
          phone: "9800000001",
          authProvider: null,
          profileImageUrl: null,
          preferredLanguage: null,
          isEmailVerified: false,
          isPhoneVerified: false,
          createdAt: 1,
          updatedAt: 1,
        },
      })),
    };

    const saveAuthCredentialUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "cred-new",
          userRemoteId: "user-new",
          loginId: "9800000001",
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
    };

    const authUserRepository = {
      getAuthUserByRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "AUTH_USER_NOT_FOUND",
          message: "not found",
        },
      })),
      deleteAuthUserByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as AuthUserRepository;

    const authCredentialRepository = {
      getAuthCredentialByLoginId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: AuthSessionErrorType.AuthCredentialNotFound,
          message: "not found",
        },
      })),
      deleteAuthCredentialByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
      deactivateAuthCredentialByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as any;

    const passwordHashService = {
      generateSalt: vi.fn(async () => "salt"),
      hash: vi.fn(async () => "hash"),
      compare: vi.fn(async () => true),
      needsRehash: vi.fn(() => false),
    };

    const useCase = createCreateAccountMemberUseCase({
      userManagementRepository,
      saveAuthUserUseCase: saveAuthUserUseCase as any,
      saveAuthCredentialUseCase: saveAuthCredentialUseCase as any,
      authUserRepository,
      authCredentialRepository,
      passwordHashService: passwordHashService as any,
    });

    const result = await useCase.execute({
      accountRemoteId: "account-1",
      actorUserRemoteId: "owner-1",
      fullName: "New User",
      email: "new@elekha.com",
      phone: "9800000001",
      password: "password123",
      roleRemoteId: "role-staff",
    });

    expect(result.success).toBe(false);
    expect(userManagementRepository.deleteAccountMemberByRemoteId).toHaveBeenCalledWith(
      "member-1",
    );
    expect(authCredentialRepository.deleteAuthCredentialByRemoteId).toHaveBeenCalledWith(
      "mocked-uuid",
    );
    expect(authUserRepository.deleteAuthUserByRemoteId).toHaveBeenCalledWith(
      "mocked-uuid",
    );
  });
});
