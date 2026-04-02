import {
  AssignUserManagementRolePayload,
  AccountUserRoleAssignmentResult,
} from "../types/userManagement.types";

export interface AssignUserManagementRoleUseCase {
  execute(
    payload: AssignUserManagementRolePayload,
  ): Promise<AccountUserRoleAssignmentResult>;
}
