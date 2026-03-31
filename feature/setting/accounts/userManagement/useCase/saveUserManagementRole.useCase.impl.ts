import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  SaveUserManagementRoleCommandPayload,
  SaveUserManagementRolePayload,
  UserManagementForbiddenError,
  UserManagementRoleResult,
  UserManagementValidationError,
} from "../types/userManagement.types";
import { SaveUserManagementRoleUseCase } from "./saveUserManagementRole.useCase";

const MANAGE_ROLES_PERMISSION_CODE = "user_management.manage_roles";

const normalizeRequired = (value: string): string => value.trim();

export const createSaveUserManagementRoleUseCase = (
  userManagementRepository: UserManagementRepository,
): SaveUserManagementRoleUseCase => ({
  async execute(
    payload: SaveUserManagementRoleCommandPayload,
  ): Promise<UserManagementRoleResult> {
    const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
    const normalizedActorUserRemoteId = normalizeRequired(
      payload.actorUserRemoteId ?? "",
    );

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

    const permissionCodesResult = await userManagementRepository.getPermissionCodesByAccountUser(
      {
        accountRemoteId: normalizedAccountRemoteId,
        userRemoteId: normalizedActorUserRemoteId,
      },
    );

    if (!permissionCodesResult.success) {
      return permissionCodesResult;
    }

    if (!permissionCodesResult.value.includes(MANAGE_ROLES_PERMISSION_CODE)) {
      return {
        success: false,
        error: UserManagementForbiddenError(
          "You do not have permission to create or edit roles.",
        ),
      };
    }

    const repositoryPayload: SaveUserManagementRolePayload = {
      remoteId: payload.remoteId,
      accountRemoteId: normalizedAccountRemoteId,
      name: payload.name,
      permissionCodes: payload.permissionCodes,
      isSystem: payload.isSystem,
      isDefault: payload.isDefault,
    };

    return userManagementRepository.saveRole(repositoryPayload);
  },
});
