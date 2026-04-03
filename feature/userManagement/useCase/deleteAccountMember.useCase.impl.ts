import { AccountSelectionErrorType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { GetAccessibleAccountsByUserRemoteIdUseCase } from "@/feature/auth/accountSelection/useCase/getAccessibleAccountsByUserRemoteId.useCase";
import { AuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository";
import { AuthSessionErrorType } from "@/feature/session/types/authSession.types";
import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
    DeleteAccountMemberPayload,
    UserManagementDatabaseError,
    UserManagementError,
    UserManagementErrorType,
    UserManagementForbiddenError,
    UserManagementOperationResult,
    UserManagementUnknownError,
    UserManagementValidationError,
} from "../types/userManagement.types";
import { DeleteAccountMemberUseCase } from "./deleteAccountMember.useCase";

const MANAGE_STAFF_PERMISSION_CODE = "user_management.manage_staff";

const normalizeRequired = (value: string): string => value.trim();

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

const mapAuthCredentialError = (error: { type: string; message: string }) => {
  if (error.type === AuthSessionErrorType.DatabaseError) {
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

export const createDeleteAccountMemberUseCase = (params: {
  userManagementRepository: UserManagementRepository;
  getAccessibleAccountsByUserRemoteIdUseCase: GetAccessibleAccountsByUserRemoteIdUseCase;
  authCredentialRepository: AuthCredentialRepository;
}): DeleteAccountMemberUseCase => ({
  async execute(
    payload: DeleteAccountMemberPayload,
  ): Promise<UserManagementOperationResult> {
    const {
      userManagementRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
      authCredentialRepository,
    } = params;
    const normalizedAccountRemoteId = normalizeRequired(
      payload.accountRemoteId,
    );
    const normalizedActorUserRemoteId = normalizeRequired(
      payload.actorUserRemoteId,
    );
    const normalizedMemberRemoteId = normalizeRequired(payload.memberRemoteId);

    if (!normalizedAccountRemoteId) {
      return {
        success: false,
        error: UserManagementValidationError("Account remote id is required."),
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
          "You do not have permission to delete staff members.",
        ),
      };
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

    const accessibleAccountsResult =
      await getAccessibleAccountsByUserRemoteIdUseCase.execute(
        memberResult.value.userRemoteId,
      );

    if (!accessibleAccountsResult.success) {
      return {
        success: false,
        error: mapAccessibleAccountsError(accessibleAccountsResult.error),
      };
    }

    const remainingAccessibleAccounts = accessibleAccountsResult.value.filter(
      (account) => account.remoteId !== normalizedAccountRemoteId,
    );
    const shouldDeactivateCredential = remainingAccessibleAccounts.length === 0;
    const targetMember = memberResult.value;
    let previousRoleRemoteId: string | null = null;

    if (shouldDeactivateCredential) {
      const assignmentResult =
        await userManagementRepository.getUserRoleAssignment(
          normalizedAccountRemoteId,
          targetMember.userRemoteId,
        );

      if (assignmentResult.success) {
        previousRoleRemoteId = assignmentResult.value.roleRemoteId;
      } else if (
        assignmentResult.error.type !== UserManagementErrorType.NotFound
      ) {
        return assignmentResult;
      }
    }

    const rollbackMemberDeletion = async (
      operationError: UserManagementError,
    ): Promise<UserManagementOperationResult> => {
      const restoreMemberResult =
        await userManagementRepository.saveAccountMember({
          remoteId: targetMember.remoteId,
          accountRemoteId: targetMember.accountRemoteId,
          userRemoteId: targetMember.userRemoteId,
          status: targetMember.status,
          invitedByUserRemoteId: targetMember.invitedByUserRemoteId,
          joinedAt: targetMember.joinedAt,
          lastActiveAt: targetMember.lastActiveAt,
        });

      if (!restoreMemberResult.success) {
        return {
          success: false,
          error: {
            ...UserManagementUnknownError,
            message: `${operationError.message} Member rollback failed: ${restoreMemberResult.error.message}`,
          },
        };
      }

      if (previousRoleRemoteId) {
        const restoreAssignmentResult =
          await userManagementRepository.assignUserRole({
            accountRemoteId: normalizedAccountRemoteId,
            actorUserRemoteId: normalizedActorUserRemoteId,
            userRemoteId: targetMember.userRemoteId,
            roleRemoteId: previousRoleRemoteId,
          });

        if (!restoreAssignmentResult.success) {
          return {
            success: false,
            error: {
              ...UserManagementUnknownError,
              message: `${operationError.message} Role assignment rollback failed: ${restoreAssignmentResult.error.message}`,
            },
          };
        }
      }

      return {
        success: false,
        error: operationError,
      };
    };

    const deleteResult =
      await userManagementRepository.deleteAccountMemberByRemoteId(
        normalizedMemberRemoteId,
      );

    if (!deleteResult.success) {
      return deleteResult;
    }

    if (!shouldDeactivateCredential) {
      return deleteResult;
    }

    const credentialResult =
      await authCredentialRepository.getAuthCredentialByUserRemoteId(
        targetMember.userRemoteId,
      );

    if (credentialResult.success) {
      const deactivateResult =
        await authCredentialRepository.deactivateAuthCredentialByRemoteId(
          credentialResult.value.remoteId,
        );

      if (!deactivateResult.success) {
        return rollbackMemberDeletion(
          mapAuthCredentialError(deactivateResult.error),
        );
      }
    } else if (
      credentialResult.error.type !==
      AuthSessionErrorType.AuthCredentialNotFound
    ) {
      return rollbackMemberDeletion(
        mapAuthCredentialError(credentialResult.error),
      );
    }

    return deleteResult;
  },
});
