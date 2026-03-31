import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  DeleteUserManagementRolePayload,
  UserManagementForbiddenError,
  UserManagementOperationResult,
  UserManagementValidationError,
} from "../types/userManagement.types";
import { DeleteUserManagementRoleUseCase } from "./deleteUserManagementRole.useCase";

const MANAGE_ROLE_PERMISSION_CODE = "user_management.manage_roles";

const normalizeRequired = (value: string): string => value.trim();

export const createDeleteUserManagementRoleUseCase = (
  userManagementRepository: UserManagementRepository,
): DeleteUserManagementRoleUseCase => ({
  async execute(
    payload: DeleteUserManagementRolePayload,
  ): Promise<UserManagementOperationResult> {
    const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
    const normalizedActorUserRemoteId = normalizeRequired(payload.actorUserRemoteId);
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

    if (!normalizedRoleRemoteId) {
      return {
        success: false,
        error: UserManagementValidationError("Role remote id is required."),
      };
    }

    const permissionCodesResult = await userManagementRepository.getPermissionCodesByAccountUser(
      {
        accountRemoteId: normalizedAccountRemoteId,
        userRemoteId: normalizedActorUserRemoteId,
      },
    );

    if (!permissionCodesResult.success) {
      return permissionCodesResult;
    }

    if (!permissionCodesResult.value.includes(MANAGE_ROLE_PERMISSION_CODE)) {
      return {
        success: false,
        error: UserManagementForbiddenError("You do not have permission to delete roles."),
      };
    }

    const rolesResult = await userManagementRepository.getRolesByAccountRemoteId(
      normalizedAccountRemoteId,
    );

    if (!rolesResult.success) {
      return rolesResult;
    }

    const roleExists = rolesResult.value.some(
      (role) => role.remoteId === normalizedRoleRemoteId,
    );

    if (!roleExists) {
      return {
        success: false,
        error: UserManagementValidationError(
          "Selected role was not found in the active account.",
        ),
      };
    }

    return userManagementRepository.deleteRoleByRemoteId(normalizedRoleRemoteId);
  },
});

