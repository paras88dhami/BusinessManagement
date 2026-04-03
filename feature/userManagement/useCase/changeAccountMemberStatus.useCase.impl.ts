import { AccountSelectionErrorType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { GetAccessibleAccountsByUserRemoteIdUseCase } from "@/feature/auth/accountSelection/useCase/getAccessibleAccountsByUserRemoteId.useCase";
import { AuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository";
import { AuthSessionErrorType } from "@/feature/session/types/authSession.types";
import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
    AccountMemberStatus,
    ChangeAccountMemberStatusPayload,
    UserManagementDatabaseError,
    UserManagementError,
    UserManagementForbiddenError,
    UserManagementOperationResult,
    UserManagementUnknownError,
    UserManagementValidationError,
} from "../types/userManagement.types";
import { ChangeAccountMemberStatusUseCase } from "./changeAccountMemberStatus.useCase";

const MANAGE_STAFF_PERMISSION_CODE = "user_management.manage_staff";

type ChangeAccountMemberStatusUseCaseParams = {
  userManagementRepository: UserManagementRepository;
  authCredentialRepository: AuthCredentialRepository;
  getAccessibleAccountsByUserRemoteIdUseCase: GetAccessibleAccountsByUserRemoteIdUseCase;
};

const normalizeRequired = (value: string): string => value.trim();

const mapAuthSessionError = (
  error: { type: string; message: string } | unknown,
) => {
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    "message" in error
  ) {
    const typedError = error as { type: string; message: string };

    if (typedError.type === AuthSessionErrorType.DatabaseError) {
      return {
        ...UserManagementDatabaseError,
        message: typedError.message,
      };
    }

    return {
      ...UserManagementUnknownError,
      message: typedError.message,
    };
  }

  return UserManagementUnknownError;
};

const mapAccessibleAccountsError = (error: {
  type: string;
  message: string;
}) => {
  if (error.type === AccountSelectionErrorType.ValidationError) {
    return UserManagementValidationError(error.message);
  }

  if (error.type === AccountSelectionErrorType.DatabaseError) {
    return {
      ...UserManagementDatabaseError,
      message: error.message,
    };
  }

  return {
    ...UserManagementUnknownError,
    message: error.message,
  };
};

export const createChangeAccountMemberStatusUseCase = (
  params: ChangeAccountMemberStatusUseCaseParams,
): ChangeAccountMemberStatusUseCase => {
  const {
    userManagementRepository,
    authCredentialRepository,
    getAccessibleAccountsByUserRemoteIdUseCase,
  } = params;

  return {
    async execute(
      payload: ChangeAccountMemberStatusPayload,
    ): Promise<UserManagementOperationResult> {
      const normalizedAccountRemoteId = normalizeRequired(
        payload.accountRemoteId,
      );
      const normalizedActorUserRemoteId = normalizeRequired(
        payload.actorUserRemoteId,
      );
      const normalizedMemberRemoteId = normalizeRequired(
        payload.memberRemoteId,
      );

      if (!normalizedAccountRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError(
            "Account remote id is required.",
          ),
        };
      }

      if (!normalizedActorUserRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError(
            "Actor user remote id is required.",
          ),
        };
      }

      if (!normalizedMemberRemoteId) {
        return {
          success: false,
          error: UserManagementValidationError("Member remote id is required."),
        };
      }

      if (
        payload.status !== AccountMemberStatus.Active &&
        payload.status !== AccountMemberStatus.Inactive &&
        payload.status !== AccountMemberStatus.Invited
      ) {
        return {
          success: false,
          error: UserManagementValidationError("Invalid member status."),
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

      if (!permissionCodesResult.value.includes(MANAGE_STAFF_PERMISSION_CODE)) {
        return {
          success: false,
          error: UserManagementForbiddenError(
            "You do not have permission to update staff status.",
          ),
        };
      }

      const ownerUserResult =
        await userManagementRepository.getAccountOwnerUserRemoteId(
          normalizedAccountRemoteId,
        );

      if (!ownerUserResult.success) {
        return ownerUserResult;
      }

      const memberResult =
        await userManagementRepository.getAccountMemberByRemoteId(
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

      if (
        memberResult.value.userRemoteId === ownerUserResult.value &&
        payload.status !== AccountMemberStatus.Active
      ) {
        return {
          success: false,
          error: UserManagementForbiddenError(
            "Account owner cannot be deactivated.",
          ),
        };
      }

      const targetMember = memberResult.value;

      let shouldDeactivateCredential = false;

      if (payload.status !== AccountMemberStatus.Active) {
        const accessibleAccountsResult =
          await getAccessibleAccountsByUserRemoteIdUseCase.execute(
            targetMember.userRemoteId,
          );

        if (!accessibleAccountsResult.success) {
          return {
            success: false,
            error: mapAccessibleAccountsError(accessibleAccountsResult.error),
          };
        }

        const remainingAccessibleAccounts =
          accessibleAccountsResult.value.filter(
            (account) => account.remoteId !== normalizedAccountRemoteId,
          );
        shouldDeactivateCredential = remainingAccessibleAccounts.length === 0;
      }

      const rollbackMemberStatus = async (
        operationError: UserManagementError,
      ): Promise<UserManagementOperationResult> => {
        const rollbackResult = await userManagementRepository.saveAccountMember(
          {
            remoteId: targetMember.remoteId,
            accountRemoteId: targetMember.accountRemoteId,
            userRemoteId: targetMember.userRemoteId,
            status: targetMember.status,
            invitedByUserRemoteId: targetMember.invitedByUserRemoteId,
            joinedAt: targetMember.joinedAt,
            lastActiveAt: targetMember.lastActiveAt,
          },
        );

        if (rollbackResult.success) {
          return {
            success: false,
            error: operationError,
          };
        }

        return {
          success: false,
          error: {
            ...UserManagementUnknownError,
            message: `${operationError.message} Status rollback failed: ${rollbackResult.error.message}`,
          },
        };
      };

      const saveMemberResult = await userManagementRepository.saveAccountMember(
        {
          remoteId: targetMember.remoteId,
          accountRemoteId: normalizedAccountRemoteId,
          userRemoteId: targetMember.userRemoteId,
          status: payload.status,
          invitedByUserRemoteId: targetMember.invitedByUserRemoteId,
          joinedAt: targetMember.joinedAt,
          lastActiveAt:
            payload.status === AccountMemberStatus.Active
              ? Date.now()
              : targetMember.lastActiveAt,
        },
      );

      if (!saveMemberResult.success) {
        return saveMemberResult;
      }

      const shouldReadCredential =
        payload.status === AccountMemberStatus.Active ||
        shouldDeactivateCredential;

      if (!shouldReadCredential) {
        return { success: true, value: true };
      }

      const credentialResult =
        await authCredentialRepository.getAuthCredentialByUserRemoteId(
          targetMember.userRemoteId,
        );

      if (credentialResult.success) {
        if (shouldDeactivateCredential) {
          const deactivateResult =
            await authCredentialRepository.deactivateAuthCredentialByRemoteId(
              credentialResult.value.remoteId,
            );

          if (!deactivateResult.success) {
            return rollbackMemberStatus(
              mapAuthSessionError(deactivateResult.error),
            );
          }
        }

        if (
          payload.status === AccountMemberStatus.Active &&
          !credentialResult.value.isActive
        ) {
          const activateResult =
            await authCredentialRepository.saveAuthCredential({
              remoteId: credentialResult.value.remoteId,
              userRemoteId: credentialResult.value.userRemoteId,
              loginId: credentialResult.value.loginId,
              credentialType: credentialResult.value.credentialType,
              passwordHash: credentialResult.value.passwordHash,
              passwordSalt: credentialResult.value.passwordSalt,
              hint: credentialResult.value.hint,
              isActive: true,
            });

          if (!activateResult.success) {
            return rollbackMemberStatus(
              mapAuthSessionError(activateResult.error),
            );
          }
        }
      } else if (
        credentialResult.error.type !==
        AuthSessionErrorType.AuthCredentialNotFound
      ) {
        return rollbackMemberStatus(
          mapAuthSessionError(credentialResult.error),
        );
      }

      return { success: true, value: true };
    },
  };
};
