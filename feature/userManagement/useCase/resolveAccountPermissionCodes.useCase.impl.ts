import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  AccountPermissionCodesResult,
  ResolveAccountPermissionCodesPayload,
} from "../types/userManagement.types";
import { ResolveAccountPermissionCodesUseCase } from "./resolveAccountPermissionCodes.useCase";

export const createResolveAccountPermissionCodesUseCase = (
  userManagementRepository: UserManagementRepository,
): ResolveAccountPermissionCodesUseCase => ({
  async execute(
    payload: ResolveAccountPermissionCodesPayload,
  ): Promise<AccountPermissionCodesResult> {
    const ensureOwnerRoleResult =
      await userManagementRepository.ensureDefaultOwnerRoleForAccountUser(payload);

    if (!ensureOwnerRoleResult.success) {
      return ensureOwnerRoleResult;
    }

    return userManagementRepository.getPermissionCodesByAccountUser(payload);
  },
});
