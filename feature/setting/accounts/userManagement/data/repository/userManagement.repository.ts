import {
  AccountMemberResult,
  AccountMembersResult,
  AccountMembersWithRoleResult,
  AccountRemoteIdsResult,
  AccountPermissionCodesResult,
  AccountUserRoleAssignmentResult,
  AssignUserManagementRolePayload,
  ResolveAccountPermissionCodesPayload,
  SaveAccountMemberPayload,
  SaveUserManagementRolePayload,
  UserManagementError,
  UserManagementOperationResult,
  UserManagementPermissionResult,
  UserManagementPermissionsResult,
  UserManagementRoleResult,
  UserManagementRolesResult,
} from "../../types/userManagement.types";
import { Result } from "@/shared/types/result.types";

export interface UserManagementRepository {
  ensurePermissionCatalogSeeded(): Promise<UserManagementOperationResult>;
  getPermissionCatalog(): Promise<UserManagementPermissionsResult>;
  getPermissionByCode(code: string): Promise<UserManagementPermissionResult>;
  getRolesByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<UserManagementRolesResult>;
  getAccountOwnerUserRemoteId(
    accountRemoteId: string,
  ): Promise<Result<string, UserManagementError>>;
  getAccountMemberByRemoteId(memberRemoteId: string): Promise<AccountMemberResult>;
  getAccountMemberByAccountAndUser(
    accountRemoteId: string,
    userRemoteId: string,
  ): Promise<AccountMemberResult>;
  getAccountMembersByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<AccountMembersResult>;
  getAccountMembersWithRoleByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<AccountMembersWithRoleResult>;
  saveAccountMember(
    payload: SaveAccountMemberPayload,
  ): Promise<AccountMemberResult>;
  deleteAccountMemberByRemoteId(
    memberRemoteId: string,
  ): Promise<UserManagementOperationResult>;
  getActiveMemberAccountRemoteIdsByUserRemoteId(
    userRemoteId: string,
  ): Promise<AccountRemoteIdsResult>;
  saveRole(payload: SaveUserManagementRolePayload): Promise<UserManagementRoleResult>;
  deleteRoleByRemoteId(roleRemoteId: string): Promise<UserManagementOperationResult>;
  assignUserRole(
    payload: AssignUserManagementRolePayload,
  ): Promise<AccountUserRoleAssignmentResult>;
  getUserRoleAssignment(
    accountRemoteId: string,
    userRemoteId: string,
  ): Promise<AccountUserRoleAssignmentResult>;
  ensureDefaultOwnerRoleForAccountUser(
    payload: ResolveAccountPermissionCodesPayload,
  ): Promise<UserManagementRoleResult>;
  getPermissionCodesByAccountUser(
    payload: ResolveAccountPermissionCodesPayload,
  ): Promise<AccountPermissionCodesResult>;
}
