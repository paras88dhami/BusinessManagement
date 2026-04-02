import { UserManagementRepository } from "../data/repository/userManagement.repository";
import {
  buildDefaultRoleRemoteId,
  USER_MANAGEMENT_DEFAULT_ROLE_TEMPLATES,
} from "../types/userManagementDefaultRoles.shared";
import {
  ResolveAccountPermissionCodesPayload,
  UserManagementOperationResult,
  UserManagementErrorType,
  UserManagementSnapshotResult,
} from "../types/userManagement.types";
import { GetUserManagementSnapshotUseCase } from "./getUserManagementSnapshot.useCase";

const MANAGE_ROLES_PERMISSION_CODE = "user_management.manage_roles";

const ensureBusinessDefaultRoles = async (params: {
  accountRemoteId: string;
  userManagementRepository: UserManagementRepository;
}): Promise<UserManagementOperationResult> => {
  const { accountRemoteId, userManagementRepository } = params;

  const [rolesResult, permissionCatalogResult] = await Promise.all([
    userManagementRepository.getRolesByAccountRemoteId(accountRemoteId),
    userManagementRepository.getPermissionCatalog(),
  ]);

  if (!rolesResult.success) {
    return rolesResult;
  }

  if (!permissionCatalogResult.success) {
    return permissionCatalogResult;
  }

  const availablePermissionCodes = new Set(
    permissionCatalogResult.value.map((permission) => permission.code),
  );
  const existingRoleNameSet = new Set(
    rolesResult.value.map((role) => role.name.trim().toLowerCase()),
  );

  for (const defaultRoleTemplate of USER_MANAGEMENT_DEFAULT_ROLE_TEMPLATES) {
    const defaultRoleRemoteId = buildDefaultRoleRemoteId(
      accountRemoteId,
      defaultRoleTemplate.slug,
    );
    const roleByRemoteIdExists = rolesResult.value.some(
      (role) => role.remoteId === defaultRoleRemoteId,
    );
    const roleByNameExists = existingRoleNameSet.has(
      defaultRoleTemplate.name.trim().toLowerCase(),
    );

    if (roleByRemoteIdExists || roleByNameExists) {
      continue;
    }

    const defaultPermissionCodes = defaultRoleTemplate.permissionCodes.filter(
      (permissionCode) => availablePermissionCodes.has(permissionCode),
    );
    const saveDefaultRoleResult = await userManagementRepository.saveRole({
      remoteId: defaultRoleRemoteId,
      accountRemoteId,
      name: defaultRoleTemplate.name,
      permissionCodes: [...defaultPermissionCodes],
      isSystem: false,
      isDefault: false,
    });

    if (!saveDefaultRoleResult.success) {
      if (saveDefaultRoleResult.error.type === UserManagementErrorType.Conflict) {
        continue;
      }

      return saveDefaultRoleResult;
    }

    existingRoleNameSet.add(defaultRoleTemplate.name.trim().toLowerCase());
  }

  return {
    success: true,
    value: true,
  };
};

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

    const permissionCodesResult =
      await userManagementRepository.getPermissionCodesByAccountUser(payload);

    if (!permissionCodesResult.success) {
      return permissionCodesResult;
    }

    const canSeedDefaultRoles = permissionCodesResult.value.includes(
      MANAGE_ROLES_PERMISSION_CODE,
    );

    if (canSeedDefaultRoles) {
      const defaultRolesSeedResult = await ensureBusinessDefaultRoles({
        accountRemoteId: payload.accountRemoteId,
        userManagementRepository,
      });

      if (!defaultRolesSeedResult.success) {
        return defaultRolesSeedResult;
      }
    }

    const [permissionsResult, rolesResult, membersResult, assignmentResult] =
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
