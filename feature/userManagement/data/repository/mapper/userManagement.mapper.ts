import {
  AccountMember,
  AccountUserRoleAssignment,
  UserManagementPermission,
  UserManagementRole,
} from "@/feature/userManagement/types/userManagement.types";
import { AccountMemberModel } from "../../dataSource/db/accountMember.model";
import { AccountRoleModel } from "../../dataSource/db/accountRole.model";
import { AccountUserRoleModel } from "../../dataSource/db/accountUserRole.model";
import { UserManagementPermissionModel } from "../../dataSource/db/userManagementPermission.model";

export const mapPermissionModelToDomain = (
  model: UserManagementPermissionModel,
): UserManagementPermission => ({
  code: model.code,
  module: model.module,
  label: model.label,
  description: model.description,
});

export const mapRoleModelToDomain = (
  model: AccountRoleModel,
  permissionCodes: readonly string[],
): UserManagementRole => ({
  remoteId: model.remoteId,
  accountRemoteId: model.accountRemoteId,
  name: model.name,
  isSystem: model.isSystem,
  isDefault: model.isDefault,
  permissionCodes: [...permissionCodes],
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});

export const mapAccountMemberModelToDomain = (
  model: AccountMemberModel,
): AccountMember => ({
  remoteId: model.remoteId,
  accountRemoteId: model.accountRemoteId,
  userRemoteId: model.userRemoteId,
  status: model.status,
  invitedByUserRemoteId: model.invitedByUserRemoteId,
  joinedAt: model.joinedAt,
  lastActiveAt: model.lastActiveAt,
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});

export const mapAccountUserRoleModelToDomain = (
  model: AccountUserRoleModel,
): AccountUserRoleAssignment => ({
  accountRemoteId: model.accountRemoteId,
  userRemoteId: model.userRemoteId,
  roleRemoteId: model.roleRemoteId,
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});
