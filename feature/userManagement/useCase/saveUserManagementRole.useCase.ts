import {
  SaveUserManagementRoleCommandPayload,
  UserManagementRoleResult,
} from "../types/userManagement.types";

export interface SaveUserManagementRoleUseCase {
  execute(payload: SaveUserManagementRoleCommandPayload): Promise<UserManagementRoleResult>;
}
