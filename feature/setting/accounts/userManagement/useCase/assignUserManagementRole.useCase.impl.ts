import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  AccountUserRoleAssignmentResult,
  AssignUserManagementRolePayload,
} from "../types/userManagement.types";
import { AssignUserManagementRoleUseCase } from "./assignUserManagementRole.useCase";

export const createAssignUserManagementRoleUseCase = (
  userManagementRepository: UserManagementRepository,
): AssignUserManagementRoleUseCase => ({
  async execute(
    payload: AssignUserManagementRolePayload,
  ): Promise<AccountUserRoleAssignmentResult> {
    return userManagementRepository.assignUserRole(payload);
  },
});
