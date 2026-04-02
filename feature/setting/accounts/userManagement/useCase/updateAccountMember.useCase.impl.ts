import {
  SignUpPhoneCountryCode,
  SIGN_UP_PHONE_COUNTRY_OPTIONS,
} from "@/feature/auth/signUp/types/signUp.types";
import {
  getInvalidSignUpPhoneMessageForCountry,
  isValidSignUpPhoneForCountry,
  sanitizeSignUpPhoneDigits,
} from "@/feature/auth/signUp/utils/signUpPhoneNumber.util";
import { AuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository";
import { GetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase";
import {
  AuthSessionErrorType,
  CredentialType,
} from "@/feature/session/types/authSession.types";
import { PasswordHashService } from "@/shared/utils/auth/passwordHash.service";
import { composePhoneNumberWithDialCode } from "@/shared/utils/auth/phoneNumber.util";
import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  AccountMemberWithRoleResult,
  UpdateAccountMemberPayload,
  UserManagementConflictError,
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
  authCredentialRepository: AuthCredentialRepository;
  passwordHashService: PasswordHashService;
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

const buildPhoneLoginId = (
  phoneCountryCode: SignUpPhoneCountryCode,
  phone: string,
):
  | { success: true; value: string }
  | { success: false; error: ReturnType<typeof UserManagementValidationError> } => {
  const phoneDigits = sanitizeSignUpPhoneDigits(phone);

  if (!isValidSignUpPhoneForCountry(phoneDigits, phoneCountryCode)) {
    return {
      success: false,
      error: UserManagementValidationError(
        getInvalidSignUpPhoneMessageForCountry(phoneCountryCode),
      ),
    };
  }

  const phoneCountryOption =
    SIGN_UP_PHONE_COUNTRY_OPTIONS.find((option) => option.code === phoneCountryCode) ??
    SIGN_UP_PHONE_COUNTRY_OPTIONS[0];

  const loginId = composePhoneNumberWithDialCode(phoneDigits, phoneCountryOption.dialCode);

  if (!loginId) {
    return {
      success: false,
      error: UserManagementValidationError("Enter a valid phone number."),
    };
  }

  return { success: true, value: loginId };
};

export const createUpdateAccountMemberUseCase = (
  params: UpdateAccountMemberUseCaseParams,
): UpdateAccountMemberUseCase => {
  const {
    userManagementRepository,
    getAuthUserByRemoteIdUseCase,
    authCredentialRepository,
    passwordHashService,
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
      const normalizedPassword = normalizeOptional(payload.password ?? null);

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

      if (normalizedPassword !== null && normalizedPassword.length < 6) {
        return {
          success: false,
          error: UserManagementValidationError(
            "Password must be at least 6 characters.",
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

      const currentCredentialResult =
        await authCredentialRepository.getAuthCredentialByUserRemoteId(
          memberResult.value.userRemoteId,
        );

      if (!currentCredentialResult.success) {
        return {
          success: false,
          error: mapAuthSessionErrorToUserManagementError(currentCredentialResult.error),
        };
      }

      const existingAuthUser = authUserResult.value;
      const existingCredential = currentCredentialResult.value;

      let nextPhone = existingCredential.loginId;

      if (payload.phone !== undefined) {
        if (!payload.phoneCountryCode) {
          return {
            success: false,
            error: UserManagementValidationError("Phone country is required."),
          };
        }

        const normalizedPhoneResult = buildPhoneLoginId(
          payload.phoneCountryCode,
          payload.phone,
        );

        if (!normalizedPhoneResult.success) {
          return {
            success: false,
            error: normalizedPhoneResult.error,
          };
        }

        nextPhone = normalizedPhoneResult.value;
      }

      if (nextPhone !== existingCredential.loginId) {
        const phoneConflictResult = await authCredentialRepository.getAuthCredentialByLoginId(
          nextPhone,
          CredentialType.Password,
        );

        if (
          phoneConflictResult.success &&
          phoneConflictResult.value.remoteId !== existingCredential.remoteId
        ) {
          return {
            success: false,
            error: UserManagementConflictError(
              "An account with this phone number already exists.",
            ),
          };
        }

        if (
          !phoneConflictResult.success &&
          phoneConflictResult.error.type !== AuthSessionErrorType.AuthCredentialNotFound
        ) {
          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(phoneConflictResult.error),
          };
        }
      }

      const nextFullName = normalizedFullName ?? existingAuthUser.fullName;
      const nextEmail = payload.email === undefined ? existingAuthUser.email : normalizedEmail;
      const shouldUpdateProfile =
        nextFullName !== existingAuthUser.fullName ||
        nextEmail !== existingAuthUser.email ||
        nextPhone !== (existingAuthUser.phone ?? "");
      const shouldUpdateCredential =
        nextPhone !== existingCredential.loginId || normalizedPassword !== null;

      let nextPasswordHash = existingCredential.passwordHash;
      let nextPasswordSalt = existingCredential.passwordSalt;

      if (normalizedPassword !== null) {
        try {
          nextPasswordSalt = await passwordHashService.generateSalt();
          nextPasswordHash = await passwordHashService.hash(
            normalizedPassword,
            nextPasswordSalt,
          );
        } catch (error) {
          return {
            success: false,
            error: mapAuthSessionErrorToUserManagementError(error),
          };
        }
      }

      if (shouldUpdateProfile || shouldUpdateCredential || (shouldAssignRole && normalizedRoleRemoteId)) {
        const updateAccessResult = await userManagementRepository.updateMemberAccessTransaction({
          authUser: {
            remoteId: existingAuthUser.remoteId,
            fullName: nextFullName,
            email: nextEmail,
            phone: nextPhone,
            authProvider: existingAuthUser.authProvider,
            profileImageUrl: existingAuthUser.profileImageUrl,
            preferredLanguage: existingAuthUser.preferredLanguage,
            isEmailVerified: existingAuthUser.isEmailVerified,
            isPhoneVerified: existingAuthUser.isPhoneVerified,
          },
          authCredential: {
            remoteId: existingCredential.remoteId,
            userRemoteId: existingCredential.userRemoteId,
            loginId: nextPhone,
            credentialType: existingCredential.credentialType,
            passwordHash: nextPasswordHash,
            passwordSalt: nextPasswordSalt,
            hint: existingCredential.hint,
            isActive: existingCredential.isActive,
          },
          roleAssignment:
            shouldAssignRole && normalizedRoleRemoteId
              ? {
                  accountRemoteId: normalizedAccountRemoteId,
                  actorUserRemoteId: normalizedActorUserRemoteId,
                  userRemoteId: memberResult.value.userRemoteId,
                  roleRemoteId: normalizedRoleRemoteId,
                }
              : null,
        });

        if (!updateAccessResult.success) {
          return updateAccessResult;
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
          error: UserManagementNotFoundError("Updated staff member was not found."),
        };
      }

      return {
        success: true,
        value: updatedMember,
      };
    },
  };
};
