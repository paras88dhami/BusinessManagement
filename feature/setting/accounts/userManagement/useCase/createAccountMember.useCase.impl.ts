import * as Crypto from "expo-crypto";
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
import {
  AuthSessionErrorType,
  CredentialType,
} from "@/feature/session/types/authSession.types";
import { PasswordHashService } from "@/shared/utils/auth/passwordHash.service";
import { composePhoneNumberWithDialCode } from "@/shared/utils/auth/phoneNumber.util";
import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  AccountMemberWithRoleResult,
  CreateAccountMemberPayload,
  UserManagementConflictError,
  UserManagementDatabaseError,
  UserManagementForbiddenError,
  UserManagementNotFoundError,
  UserManagementUnknownError,
  UserManagementValidationError,
} from "../types/userManagement.types";
import { CreateAccountMemberUseCase } from "./createAccountMember.useCase";

const MANAGE_STAFF_PERMISSION_CODE = "user_management.manage_staff";
const ASSIGN_ROLE_PERMISSION_CODE = "user_management.assign_role";

type CreateAccountMemberUseCaseParams = {
  userManagementRepository: UserManagementRepository;
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

export const createCreateAccountMemberUseCase = (
  params: CreateAccountMemberUseCaseParams,
): CreateAccountMemberUseCase => {
  const {
    userManagementRepository,
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

      const normalizedPhone = normalizedPhoneResult.value;

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

      const existingCredentialResult =
        await authCredentialRepository.getAuthCredentialByLoginId(
          normalizedPhone,
          CredentialType.Password,
        );

      if (existingCredentialResult.success) {
        return {
          success: false,
          error: UserManagementConflictError(
            "An account with this phone number already exists.",
          ),
        };
      }

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
        passwordHash = await passwordHashService.hash(normalizedPassword, passwordSalt);
      } catch (error) {
        return {
          success: false,
          error: mapAuthSessionErrorToUserManagementError(error),
        };
      }

      const userRemoteId = Crypto.randomUUID();
      const credentialRemoteId = Crypto.randomUUID();
      const memberRemoteId = `member-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      const createAccessResult = await userManagementRepository.createMemberAccessTransaction({
        authUser: {
          remoteId: userRemoteId,
          fullName: normalizedFullName,
          email: normalizedEmail,
          phone: normalizedPhone,
          authProvider: null,
          profileImageUrl: null,
          preferredLanguage: null,
          isEmailVerified: false,
          isPhoneVerified: false,
        },
        authCredential: {
          remoteId: credentialRemoteId,
          userRemoteId,
          loginId: normalizedPhone,
          credentialType: CredentialType.Password,
          passwordHash,
          passwordSalt,
          hint: null,
          isActive: true,
        },
        member: {
          remoteId: memberRemoteId,
          accountRemoteId: normalizedAccountRemoteId,
          userRemoteId,
          status: "active",
          invitedByUserRemoteId: normalizedActorUserRemoteId,
          joinedAt: Date.now(),
          lastActiveAt: null,
        },
        roleRemoteId: normalizedRoleRemoteId,
      });

      if (!createAccessResult.success) {
        return createAccessResult;
      }

      const membersResult =
        await userManagementRepository.getAccountMembersWithRoleByAccountRemoteId(
          normalizedAccountRemoteId,
        );

      if (!membersResult.success) {
        return membersResult;
      }

      const createdMember = membersResult.value.find(
        (member) => member.userRemoteId === userRemoteId,
      );

      if (!createdMember) {
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
