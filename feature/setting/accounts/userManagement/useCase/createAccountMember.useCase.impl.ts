import * as Crypto from "expo-crypto";
import { AuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository";
import { AuthUserRepository } from "@/feature/session/data/repository/authUser.repository";
import { SaveAuthCredentialUseCase } from "@/feature/session/useCase/saveAuthCredential.useCase";
import { SaveAuthUserUseCase } from "@/feature/session/useCase/saveAuthUser.useCase";
import {
  AuthCredential,
  AuthSessionErrorType,
  CredentialType,
} from "@/feature/session/types/authSession.types";
import { PasswordHashService } from "@/shared/utils/auth/passwordHash.service";
import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  AccountMemberWithRoleResult,
  CreateAccountMemberPayload,
  UserManagementConflictError,
  UserManagementDatabaseError,
  UserManagementForbiddenError,
  UserManagementErrorType,
  UserManagementNotFoundError,
  UserManagementUnknownError,
  UserManagementValidationError,
} from "../types/userManagement.types";
import { CreateAccountMemberUseCase } from "./createAccountMember.useCase";

const MANAGE_STAFF_PERMISSION_CODE = "user_management.manage_staff";
const ASSIGN_ROLE_PERMISSION_CODE = "user_management.assign_role";

type CreateAccountMemberUseCaseParams = {
  userManagementRepository: UserManagementRepository;
  saveAuthUserUseCase: SaveAuthUserUseCase;
  saveAuthCredentialUseCase: SaveAuthCredentialUseCase;
  authUserRepository: AuthUserRepository;
  authCredentialRepository: AuthCredentialRepository;
  passwordHashService: PasswordHashService;
};

const mapAuthSessionErrorToUserManagementError = (
  error: { type: string; message: string } | Error | unknown,
) => {
  if (error && typeof error === "object" && "type" in error && "message" in error) {
    const typedError = error as { type: string; message: string };

    if (typedError.type === AuthSessionErrorType.ValidationError) {
      return UserManagementValidationError(typedError.message);
    }

    if (typedError.type === AuthSessionErrorType.DatabaseError) {
      return {
        ...UserManagementDatabaseError,
        message: typedError.message,
      };
    }

    if (typedError.type === AuthSessionErrorType.AuthCredentialNotFound) {
      return UserManagementNotFoundError(typedError.message);
    }

    return {
      ...UserManagementUnknownError,
      message: typedError.message,
    };
  }

  if (error instanceof Error) {
    return {
      ...UserManagementUnknownError,
      message: error.message,
    };
  }

  return UserManagementUnknownError;
};

const normalizeRequired = (value: string): string => value.trim();

const normalizeOptional = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const activateCredential = async (
  saveAuthCredentialUseCase: SaveAuthCredentialUseCase,
  credential: AuthCredential,
) => {
  return saveAuthCredentialUseCase.execute({
    remoteId: credential.remoteId,
    userRemoteId: credential.userRemoteId,
    loginId: credential.loginId,
    credentialType: credential.credentialType,
    passwordHash: credential.passwordHash,
    passwordSalt: credential.passwordSalt,
    hint: credential.hint,
    isActive: true,
  });
};

const deactivateCredential = async (
  authCredentialRepository: AuthCredentialRepository,
  credentialRemoteId: string,
): Promise<void> => {
  await authCredentialRepository.deactivateAuthCredentialByRemoteId(credentialRemoteId);
};

export const createCreateAccountMemberUseCase = (
  params: CreateAccountMemberUseCaseParams,
): CreateAccountMemberUseCase => {
  const {
    userManagementRepository,
    saveAuthUserUseCase,
    saveAuthCredentialUseCase,
    authUserRepository,
    authCredentialRepository,
    passwordHashService,
  } = params;

  return {
    async execute(
      payload: CreateAccountMemberPayload,
    ): Promise<AccountMemberWithRoleResult> {
      const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
      const normalizedActorUserRemoteId = normalizeRequired(payload.actorUserRemoteId);
      const normalizedFullName = normalizeRequired(payload.fullName);
      const normalizedEmail = normalizeOptional(payload.email);
      const normalizedPhone = normalizeRequired(payload.phone);
      const normalizedPassword = normalizeRequired(payload.password);
      const normalizedRoleRemoteId = normalizeRequired(payload.roleRemoteId);

      if (!normalizedAccountRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError("Account remote id is required."),
        };
      }

      if (!normalizedActorUserRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError("Actor user remote id is required."),
        };
      }

      if (!normalizedFullName || normalizedFullName.length < 2) {
        return {
          success: false,
          error: UserManagementValidationError(
            "Full name must be at least 2 characters.",
          ),
        };
      }

      if (!normalizedPhone) {
        return {
          success: false,
          error: UserManagementValidationError("Phone number is required."),
        };
      }

      if (!normalizedPassword || normalizedPassword.length < 6) {
        return {
          success: false,
          error: UserManagementValidationError(
            "Password must be at least 6 characters.",
          ),
        };
      }

      if (!normalizedRoleRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError("Role remote id is required."),
        };
      }

      const permissionCodesResult =
        await userManagementRepository.getPermissionCodesByAccountUser({
          accountRemoteId: normalizedAccountRemoteId,
          userRemoteId: normalizedActorUserRemoteId,
        });

      if (!permissionCodesResult.success) {
        return permissionCodesResult;
      }

      const grantedPermissionCodes = permissionCodesResult.value;

      if (!grantedPermissionCodes.includes(MANAGE_STAFF_PERMISSION_CODE)) {
        return {
          success: false,
          error: UserManagementForbiddenError(
            "You do not have permission to create staff members.",
          ),
        };
      }

      if (!grantedPermissionCodes.includes(ASSIGN_ROLE_PERMISSION_CODE)) {
        return {
          success: false,
          error: UserManagementForbiddenError(
            "You do not have permission to assign roles.",
          ),
        };
      }

      let userRemoteId = "";
      let credentialRemoteId = "";
      let createdNewAuthUser = false;
      let createdNewCredential = false;
      let reactivatedExistingCredential = false;

      const existingCredentialResult =
        await authCredentialRepository.getAuthCredentialByLoginId(
          normalizedPhone,
          CredentialType.Password,
        );

      if (existingCredentialResult.success) {
        const existingCredential = existingCredentialResult.value;
        const existingAuthUserResult = await authUserRepository.getAuthUserByRemoteId(
          existingCredential.userRemoteId,
        );

        if (!existingAuthUserResult.success) {
          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(existingAuthUserResult.error),
          };
        }

        const existingMemberResult =
          await userManagementRepository.getAccountMemberByAccountAndUser(
            normalizedAccountRemoteId,
            existingCredential.userRemoteId,
          );

        if (existingMemberResult.success) {
          return {
            success: false,
            error: UserManagementConflictError(
              "This user is already a member of the selected account.",
            ),
          };
        }

        if (existingMemberResult.error.type !== UserManagementErrorType.NotFound) {
          return existingMemberResult;
        }

        userRemoteId = existingCredential.userRemoteId;
        credentialRemoteId = existingCredential.remoteId;

        if (!existingCredential.isActive) {
          const activateCredentialResult = await activateCredential(
            saveAuthCredentialUseCase,
            existingCredential,
          );

          if (!activateCredentialResult.success) {
            return {
              success: false,
              error: mapAuthSessionErrorToUserManagementError(
                activateCredentialResult.error,
              ),
            };
          }

          reactivatedExistingCredential = true;
        }

        const existingAuthUser = existingAuthUserResult.value;
        const shouldFillName = !existingAuthUser.fullName.trim();
        const shouldFillEmail =
          existingAuthUser.email === null && normalizedEmail !== null;
        const shouldUpdateExistingAuthUser = shouldFillName || shouldFillEmail;

        if (shouldUpdateExistingAuthUser) {
          const updateExistingAuthUserResult = await saveAuthUserUseCase.execute({
            remoteId: existingAuthUser.remoteId,
            fullName: shouldFillName ? normalizedFullName : existingAuthUser.fullName,
            email: shouldFillEmail ? normalizedEmail : existingAuthUser.email,
            phone: existingAuthUser.phone,
            authProvider: existingAuthUser.authProvider,
            profileImageUrl: existingAuthUser.profileImageUrl,
            preferredLanguage: existingAuthUser.preferredLanguage,
            isEmailVerified: existingAuthUser.isEmailVerified,
            isPhoneVerified: existingAuthUser.isPhoneVerified,
          });

          if (!updateExistingAuthUserResult.success) {
            if (reactivatedExistingCredential) {
              await deactivateCredential(authCredentialRepository, credentialRemoteId).catch(
                () => {},
              );
            }

            return {
              success: false,
              error: mapAuthSessionErrorToUserManagementError(
                updateExistingAuthUserResult.error,
              ),
            };
          }
        }
      } else {
        if (
          existingCredentialResult.error.type !==
          AuthSessionErrorType.AuthCredentialNotFound
        ) {
          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(
              existingCredentialResult.error,
            ),
          };
        }

        let passwordSalt: string;
        let passwordHash: string;

        try {
          passwordSalt = await passwordHashService.generateSalt();
          passwordHash = await passwordHashService.hash(
            normalizedPassword,
            passwordSalt,
          );
        } catch (error) {
          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(error),
          };
        }

        userRemoteId = Crypto.randomUUID();
        credentialRemoteId = Crypto.randomUUID();

        const saveAuthUserResult = await saveAuthUserUseCase.execute({
          remoteId: userRemoteId,
          fullName: normalizedFullName,
          email: normalizedEmail,
          phone: normalizedPhone,
          authProvider: null,
          profileImageUrl: null,
          preferredLanguage: null,
          isEmailVerified: false,
          isPhoneVerified: false,
        });

        if (!saveAuthUserResult.success) {
          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(saveAuthUserResult.error),
          };
        }

        createdNewAuthUser = true;

        const saveCredentialResult = await saveAuthCredentialUseCase.execute({
          remoteId: credentialRemoteId,
          userRemoteId,
          loginId: normalizedPhone,
          credentialType: CredentialType.Password,
          passwordHash,
          passwordSalt,
          hint: null,
          isActive: true,
        });

        if (!saveCredentialResult.success) {
          await authUserRepository.deleteAuthUserByRemoteId(userRemoteId).catch(() => {});

          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(saveCredentialResult.error),
          };
        }

        createdNewCredential = true;
      }

      const saveMemberResult = await userManagementRepository.saveAccountMember({
        accountRemoteId: normalizedAccountRemoteId,
        userRemoteId,
        status: "active",
        invitedByUserRemoteId: normalizedActorUserRemoteId,
        joinedAt: Date.now(),
        lastActiveAt: null,
      });

      if (!saveMemberResult.success) {
        if (createdNewCredential) {
          await authCredentialRepository
            .deleteAuthCredentialByRemoteId(credentialRemoteId)
            .catch(() => {});
        }
        if (createdNewAuthUser) {
          await authUserRepository.deleteAuthUserByRemoteId(userRemoteId).catch(() => {});
        }
        if (reactivatedExistingCredential) {
          await deactivateCredential(authCredentialRepository, credentialRemoteId).catch(
            () => {},
          );
        }

        return saveMemberResult;
      }

      const assignRoleResult = await userManagementRepository.assignUserRole({
        accountRemoteId: normalizedAccountRemoteId,
        actorUserRemoteId: normalizedActorUserRemoteId,
        userRemoteId,
        roleRemoteId: normalizedRoleRemoteId,
      });

      if (!assignRoleResult.success) {
        await userManagementRepository
          .deleteAccountMemberByRemoteId(saveMemberResult.value.remoteId)
          .catch(() => {});

        if (createdNewCredential) {
          await authCredentialRepository
            .deleteAuthCredentialByRemoteId(credentialRemoteId)
            .catch(() => {});
        }
        if (createdNewAuthUser) {
          await authUserRepository.deleteAuthUserByRemoteId(userRemoteId).catch(() => {});
        }
        if (reactivatedExistingCredential) {
          await deactivateCredential(authCredentialRepository, credentialRemoteId).catch(
            () => {},
          );
        }

        return assignRoleResult;
      }

      const membersResult =
        await userManagementRepository.getAccountMembersWithRoleByAccountRemoteId(
          normalizedAccountRemoteId,
        );

      if (!membersResult.success) {
        await userManagementRepository
          .deleteAccountMemberByRemoteId(saveMemberResult.value.remoteId)
          .catch(() => {});

        if (createdNewCredential) {
          await authCredentialRepository
            .deleteAuthCredentialByRemoteId(credentialRemoteId)
            .catch(() => {});
        }
        if (createdNewAuthUser) {
          await authUserRepository.deleteAuthUserByRemoteId(userRemoteId).catch(() => {});
        }
        if (reactivatedExistingCredential) {
          await deactivateCredential(authCredentialRepository, credentialRemoteId).catch(
            () => {},
          );
        }

        return membersResult;
      }

      const createdMember = membersResult.value.find(
        (member) => member.userRemoteId === userRemoteId,
      );

      if (!createdMember) {
        await userManagementRepository
          .deleteAccountMemberByRemoteId(saveMemberResult.value.remoteId)
          .catch(() => {});

        if (createdNewCredential) {
          await authCredentialRepository
            .deleteAuthCredentialByRemoteId(credentialRemoteId)
            .catch(() => {});
        }
        if (createdNewAuthUser) {
          await authUserRepository.deleteAuthUserByRemoteId(userRemoteId).catch(() => {});
        }
        if (reactivatedExistingCredential) {
          await deactivateCredential(authCredentialRepository, credentialRemoteId).catch(
            () => {},
          );
        }

        return {
          success: false,
          error: UserManagementNotFoundError("Created staff member was not found."),
        };
      }

      return {
        success: true,
        value: createdMember,
      };
    },
  };
};
