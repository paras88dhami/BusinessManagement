import {
  SaveAuthCredentialPayload,
  SaveAuthUserPayload,
} from "@/feature/session/types/authSession.types";
import { Result } from "@/shared/types/result.types";
import { UserManagementPermissionSeed } from "../../types/userManagementPermissionSeed.types";
import { AccountMemberModel } from "./db/accountMember.model";
import { AccountRolePermissionModel } from "./db/accountRolePermission.model";
import { AccountRoleModel } from "./db/accountRole.model";
import { AccountUserRoleModel } from "./db/accountUserRole.model";
import { UserManagementPermissionModel } from "./db/userManagementPermission.model";

export type SaveAccountRoleRecordPayload = {
  remoteId: string;
  accountRemoteId: string;
  name: string;
  isSystem: boolean;
  isDefault: boolean;
};

export type AssignAccountUserRoleRecordPayload = {
  accountRemoteId: string;
  userRemoteId: string;
  roleRemoteId: string;
};

export type SaveAccountMemberRecordPayload = {
  remoteId: string;
  accountRemoteId: string;
  userRemoteId: string;
  status: "active" | "inactive" | "invited";
  invitedByUserRemoteId: string | null;
  joinedAt: number | null;
  lastActiveAt: number | null;
};

export type CreateMemberAccessRecordPayload = {
  authUser: SaveAuthUserPayload;
  authCredential: SaveAuthCredentialPayload;
  member: SaveAccountMemberRecordPayload;
  roleAssignment: AssignAccountUserRoleRecordPayload;
};

export type UpdateMemberAccessRecordPayload = {
  authUser: SaveAuthUserPayload;
  authCredential: SaveAuthCredentialPayload;
  roleAssignment?: AssignAccountUserRoleRecordPayload | null;
};

export interface UserManagementDatasource {
  ensurePermissionCatalogSeeded(
    seed: readonly UserManagementPermissionSeed[],
  ): Promise<Result<boolean>>;
  getPermissionCatalog(): Promise<Result<UserManagementPermissionModel[]>>;
  getRoleByRemoteId(remoteId: string): Promise<Result<AccountRoleModel | null>>;
  getRolesByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<AccountRoleModel[]>>;
  getMemberByRemoteId(remoteId: string): Promise<Result<AccountMemberModel | null>>;
  getMembersByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<AccountMemberModel[]>>;
  getMemberByAccountAndUser(
    accountRemoteId: string,
    userRemoteId: string,
  ): Promise<Result<AccountMemberModel | null>>;
  createMemberAccessRecord(
    payload: CreateMemberAccessRecordPayload,
  ): Promise<Result<boolean>>;
  updateMemberAccessRecord(
    payload: UpdateMemberAccessRecordPayload,
  ): Promise<Result<boolean>>;
  saveMember(
    payload: SaveAccountMemberRecordPayload,
  ): Promise<Result<AccountMemberModel>>;
  deleteMemberByRemoteId(remoteId: string): Promise<Result<boolean>>;
  getActiveMemberAccountRemoteIdsByUserRemoteId(
    userRemoteId: string,
  ): Promise<Result<string[]>>;
  saveRole(payload: SaveAccountRoleRecordPayload): Promise<Result<AccountRoleModel>>;
  deleteRoleByRemoteId(remoteId: string): Promise<Result<boolean>>;
  deleteRolePermissionsByRoleRemoteId(roleRemoteId: string): Promise<Result<boolean>>;
  replaceRolePermissions(
    roleRemoteId: string,
    permissionCodes: readonly string[],
  ): Promise<Result<boolean>>;
  getRolePermissionsByRoleRemoteIds(
    roleRemoteIds: readonly string[],
  ): Promise<Result<AccountRolePermissionModel[]>>;
  assignUserRole(
    payload: AssignAccountUserRoleRecordPayload,
  ): Promise<Result<AccountUserRoleModel>>;
  getUserRoleAssignment(
    accountRemoteId: string,
    userRemoteId: string,
  ): Promise<Result<AccountUserRoleModel | null>>;
  getUserRoleAssignmentsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<AccountUserRoleModel[]>>;
  deleteUserRoleAssignment(
    accountRemoteId: string,
    userRemoteId: string,
  ): Promise<Result<boolean>>;
  deleteUserRoleAssignmentsByRoleRemoteId(
    roleRemoteId: string,
  ): Promise<Result<boolean>>;
}
