import {
  DeleteUserManagementRolePayload,
  UserManagementOperationResult,
} from "../types/userManagement.types";

export interface DeleteUserManagementRoleUseCase {
  execute(payload: DeleteUserManagementRolePayload): Promise<UserManagementOperationResult>;
}

