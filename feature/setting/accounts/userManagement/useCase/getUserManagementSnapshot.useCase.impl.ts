import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  ResolveAccountPermissionCodesPayload,
  UserManagementErrorType,
  UserManagementSnapshotResult,
} from "../types/userManagement.types";
import { GetUserManagementSnapshotUseCase } from "./getUserManagementSnapshot.useCase";

export const createGetUserManagementSnapshotUseCase = (
  userManagementRepository: UserManagementRepository,
): GetUserManagementSnapshotUseCase => ({
  async execute(
    payload: ResolveAccountPermissionCodesPayload,
  ): Promise<UserManagementSnapshotResult> {
    const permissionsSeedResult =
      await userManagementRepository.ensurePermissionCatalogSeeded();

    if (!permissionsSeedResult.success) {
      return permissionsSeedResult;
    }

    const ownerRoleResult =
      await userManagementRepository.ensureDefaultOwnerRoleForAccountUser(payload);

    if (!ownerRoleResult.success) {
      return ownerRoleResult;
    }

    const [
      permissionsResult,
      rolesResult,
      membersResult,
      assignmentResult,
      permissionCodesResult,
    ] =
      await Promise.all([
        userManagementRepository.getPermissionCatalog(),
        userManagementRepository.getRolesByAccountRemoteId(payload.accountRemoteId),
        userManagementRepository.getAccountMembersWithRoleByAccountRemoteId(
          payload.accountRemoteId,
        ),
        userManagementRepository.getUserRoleAssignment(
          payload.accountRemoteId,
          payload.userRemoteId,
        ),
        userManagementRepository.getPermissionCodesByAccountUser(payload),
      ]);

    if (!permissionsResult.success) {
      return permissionsResult;
    }

    if (!rolesResult.success) {
      return rolesResult;
    }

    if (!membersResult.success) {
      return membersResult;
    }

    if (!permissionCodesResult.success) {
      return permissionCodesResult;
    }

    if (
      !assignmentResult.success &&
      assignmentResult.error.type !== UserManagementErrorType.NotFound
    ) {
      return assignmentResult;
    }

    return {
      success: true,
      value: {
        permissions: permissionsResult.value,
        roles: rolesResult.value,
        members: membersResult.value,
        assignedRoleRemoteId: assignmentResult.success
          ? assignmentResult.value.roleRemoteId
          : ownerRoleResult.value.remoteId,
        grantedPermissionCodes: permissionCodesResult.value,
      },
    };
  },
});
