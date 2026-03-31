import { GetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase";
import { SaveAuthUserUseCase } from "@/feature/session/useCase/saveAuthUser.useCase";
import { AuthSessionErrorType } from "@/feature/session/types/authSession.types";
import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  AccountMemberWithRoleResult,
  UpdateAccountMemberPayload,
  UserManagementDatabaseError,
  UserManagementErrorType,
  UserManagementForbiddenError,
  UserManagementNotFoundError,
  UserManagementUnknownError,
  UserManagementValidationError,
} from "../types/userManagement.types";
import { UpdateAccountMemberUseCase } from "./updateAccountMember.useCase";

const MANAGE_STAFF_PERMISSION_CODE = "user_management.manage_staff";
const ASSIGN_ROLE_PERMISSION_CODE = "user_management.assign_role";

type UpdateAccountMemberUseCaseParams = {
  userManagementRepository: UserManagementRepository;
  getAuthUserByRemoteIdUseCase: GetAuthUserByRemoteIdUseCase;
  saveAuthUserUseCase: SaveAuthUserUseCase;
};

const normalizeRequired = (value: string): string => value.trim();

const normalizeOptional = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
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

    if (typedError.type === AuthSessionErrorType.AuthUserNotFound) {
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

export const createUpdateAccountMemberUseCase = (
  params: UpdateAccountMemberUseCaseParams,
): UpdateAccountMemberUseCase => {
  const {
    userManagementRepository,
    getAuthUserByRemoteIdUseCase,
    saveAuthUserUseCase,
  } = params;

  return {
    async execute(
      payload: UpdateAccountMemberPayload,
    ): Promise<AccountMemberWithRoleResult> {
      const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
      const normalizedActorUserRemoteId = normalizeRequired(payload.actorUserRemoteId);
      const normalizedMemberRemoteId = normalizeRequired(payload.memberRemoteId);
      const normalizedRoleRemoteId = payload.roleRemoteId
        ? normalizeRequired(payload.roleRemoteId)
        : null;
      const normalizedFullName = payload.fullName
        ? normalizeRequired(payload.fullName)
        : null;
      const normalizedEmail = normalizeOptional(payload.email);

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

      if (!normalizedMemberRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError("Member remote id is required."),
        };
      }

      if (normalizedFullName !== null && normalizedFullName.length < 2) {
        return {
          success: false,
          error: UserManagementValidationError(
            "Full name must be at least 2 characters.",
          ),
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
            "You do not have permission to update staff members.",
          ),
        };
      }

      const memberResult = await userManagementRepository.getAccountMemberByRemoteId(
        normalizedMemberRemoteId,
      );

      if (!memberResult.success) {
        return memberResult;
      }

      if (memberResult.value.accountRemoteId !== normalizedAccountRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError(
            "Member does not belong to the selected account.",
          ),
        };
      }

      let shouldAssignRole = false;

      if (normalizedRoleRemoteId) {
        const existingAssignmentResult =
          await userManagementRepository.getUserRoleAssignment(
            normalizedAccountRemoteId,
            memberResult.value.userRemoteId,
          );

        if (existingAssignmentResult.success) {
          shouldAssignRole =
            existingAssignmentResult.value.roleRemoteId !== normalizedRoleRemoteId;
        } else if (
          existingAssignmentResult.error.type === UserManagementErrorType.NotFound
        ) {
          shouldAssignRole = true;
        } else {
          return existingAssignmentResult;
        }
      }

      if (shouldAssignRole && !grantedPermissionCodes.includes(ASSIGN_ROLE_PERMISSION_CODE)) {
        return {
          success: false,
          error: UserManagementForbiddenError(
            "You do not have permission to assign roles.",
          ),
        };
      }

      const authUserResult = await getAuthUserByRemoteIdUseCase.execute(
        memberResult.value.userRemoteId,
      );

      if (!authUserResult.success) {
        return {
          success: false,
          error: mapAuthSessionErrorToUserManagementError(authUserResult.error),
        };
      }

      const existingAuthUser = authUserResult.value;
      const nextFullName = normalizedFullName ?? existingAuthUser.fullName;
      const nextEmail = payload.email === undefined ? existingAuthUser.email : normalizedEmail;
      const shouldUpdateProfile =
        nextFullName !== existingAuthUser.fullName ||
        nextEmail !== existingAuthUser.email;

      if (shouldUpdateProfile) {
        const saveAuthUserResult = await saveAuthUserUseCase.execute({
          remoteId: existingAuthUser.remoteId,
          fullName: nextFullName,
          email: nextEmail,
          phone: existingAuthUser.phone,
          authProvider: existingAuthUser.authProvider,
          profileImageUrl: existingAuthUser.profileImageUrl,
          preferredLanguage: existingAuthUser.preferredLanguage,
          isEmailVerified: existingAuthUser.isEmailVerified,
          isPhoneVerified: existingAuthUser.isPhoneVerified,
        });

        if (!saveAuthUserResult.success) {
          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(saveAuthUserResult.error),
          };
        }
      }

      if (shouldAssignRole && normalizedRoleRemoteId) {
        const assignRoleResult = await userManagementRepository.assignUserRole({
          accountRemoteId: normalizedAccountRemoteId,
          actorUserRemoteId: normalizedActorUserRemoteId,
          userRemoteId: memberResult.value.userRemoteId,
          roleRemoteId: normalizedRoleRemoteId,
        });

        if (!assignRoleResult.success) {
          if (shouldUpdateProfile) {
            const rollbackAuthUserResult = await saveAuthUserUseCase.execute({
              remoteId: existingAuthUser.remoteId,
              fullName: existingAuthUser.fullName,
              email: existingAuthUser.email,
              phone: existingAuthUser.phone,
              authProvider: existingAuthUser.authProvider,
              profileImageUrl: existingAuthUser.profileImageUrl,
              preferredLanguage: existingAuthUser.preferredLanguage,
              isEmailVerified: existingAuthUser.isEmailVerified,
              isPhoneVerified: existingAuthUser.isPhoneVerified,
            });

            if (!rollbackAuthUserResult.success) {
              const rollbackError = mapAuthSessionErrorToUserManagementError(
                rollbackAuthUserResult.error,
              );

              return {
                success: false,
                error: {
                  ...UserManagementUnknownError,
                  message: `Role update failed and profile rollback failed: ${rollbackError.message}`,
                },
              };
            }
          }

          return assignRoleResult;
        }
      }

      const membersResult =
        await userManagementRepository.getAccountMembersWithRoleByAccountRemoteId(
          normalizedAccountRemoteId,
        );

      if (!membersResult.success) {
        return membersResult;
      }

      const updatedMember = membersResult.value.find(
        (member) => member.remoteId === normalizedMemberRemoteId,
      );

      if (!updatedMember) {
        return {
          success: false,
          error: UserManagementNotFoundError("Updated member was not found."),
        };
      }

      return {
        success: true,
        value: updatedMember,
      };
    },
  };
};
