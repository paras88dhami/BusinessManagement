import { SignUpPhoneCountryCode } from "@/feature/auth/signUp/types/signUp.types";
import { Result } from "@/shared/types/result.types";

export type UserManagementPermission = {
  code: string;
  module: string;
  label: string;
  description: string;
};

export type UserManagementRole = {
  remoteId: string;
  accountRemoteId: string;
  name: string;
  isSystem: boolean;
  isDefault: boolean;
  permissionCodes: string[];
  createdAt: number;
  updatedAt: number;
};

export const AccountMemberStatus = {
  Active: "active",
  Inactive: "inactive",
  Invited: "invited",
} as const;

export type AccountMemberStatusValue =
  (typeof AccountMemberStatus)[keyof typeof AccountMemberStatus];

export type AccountMember = {
  remoteId: string;
  accountRemoteId: string;
  userRemoteId: string;
  status: AccountMemberStatusValue;
  invitedByUserRemoteId: string | null;
  joinedAt: number | null;
  lastActiveAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type AccountMemberProfile = {
  userRemoteId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
};

export type AccountMemberWithRole = AccountMember & {
  fullName: string;
  email: string | null;
  phone: string | null;
  roleRemoteId: string | null;
  roleName: string | null;
  isAccountOwner: boolean;
};

export type AccountUserRoleAssignment = {
  accountRemoteId: string;
  userRemoteId: string;
  roleRemoteId: string;
  createdAt: number;
  updatedAt: number;
};

export type SaveUserManagementRolePayload = {
  remoteId: string | null;
  accountRemoteId: string;
  name: string;
  permissionCodes: string[];
  isSystem: boolean | null;
  isDefault: boolean | null;
};

export type SaveUserManagementRoleCommandPayload = SaveUserManagementRolePayload & {
  actorUserRemoteId: string;
};

export type SaveAccountMemberPayload = {
  remoteId: string | null;
  accountRemoteId: string;
  userRemoteId: string;
  status: AccountMemberStatusValue;
  invitedByUserRemoteId: string | null;
  joinedAt: number | null;
  lastActiveAt: number | null;
};

export type AssignUserManagementRolePayload = {
  accountRemoteId: string;
  actorUserRemoteId: string;
  userRemoteId: string;
  roleRemoteId: string;
};

export type CreateAccountMemberPayload = {
  accountRemoteId: string;
  actorUserRemoteId: string;
  fullName: string;
  email: string | null;
  phoneCountryCode: SignUpPhoneCountryCode;
  phone: string;
  password: string;
  roleRemoteId: string;
};

export type UpdateAccountMemberPayload = {
  accountRemoteId: string;
  actorUserRemoteId: string;
  memberRemoteId: string;
  fullName: string;
  email: string | null;
  phoneCountryCode: SignUpPhoneCountryCode;
  phone: string;
  password: string | null;
  roleRemoteId: string | null;
};

export type ChangeAccountMemberStatusPayload = {
  accountRemoteId: string;
  actorUserRemoteId: string;
  memberRemoteId: string;
  status: AccountMemberStatusValue;
};

export type DeleteAccountMemberPayload = {
  accountRemoteId: string;
  actorUserRemoteId: string;
  memberRemoteId: string;
};

export type DeleteUserManagementRolePayload = {
  accountRemoteId: string;
  actorUserRemoteId: string;
  roleRemoteId: string;
};

export type ResolveAccountPermissionCodesPayload = {
  accountRemoteId: string;
  userRemoteId: string;
};

export type UserManagementSnapshot = {
  permissions: UserManagementPermission[];
  roles: UserManagementRole[];
  members: AccountMemberWithRole[];
  assignedRoleRemoteId: string | null;
  grantedPermissionCodes: string[];
};

export const UserManagementErrorType = {
  DatabaseError: "DATABASE_ERROR",
  ValidationError: "VALIDATION_ERROR",
  NotFound: "NOT_FOUND",
  Forbidden: "FORBIDDEN",
  Conflict: "CONFLICT",
  UnknownError: "UNKNOWN_ERROR",
} as const;

export type UserManagementError = {
  type:
    (typeof UserManagementErrorType)[keyof typeof UserManagementErrorType];
  message: string;
};

export const UserManagementDatabaseError: UserManagementError = {
  type: UserManagementErrorType.DatabaseError,
  message: "Unable to process your request right now. Please try again.",
};

export const UserManagementValidationError = (
  message: string,
): UserManagementError => ({
  type: UserManagementErrorType.ValidationError,
  message,
});

export const UserManagementNotFoundError = (
  message: string,
): UserManagementError => ({
  type: UserManagementErrorType.NotFound,
  message,
});

export const UserManagementForbiddenError = (
  message: string,
): UserManagementError => ({
  type: UserManagementErrorType.Forbidden,
  message,
});

export const UserManagementConflictError = (
  message: string,
): UserManagementError => ({
  type: UserManagementErrorType.Conflict,
  message,
});

export const UserManagementUnknownError: UserManagementError = {
  type: UserManagementErrorType.UnknownError,
  message: "An unexpected error occurred.",
};

export type UserManagementPermissionResult = Result<
  UserManagementPermission,
  UserManagementError
>;
export type UserManagementPermissionsResult = Result<
  UserManagementPermission[],
  UserManagementError
>;
export type UserManagementRoleResult = Result<
  UserManagementRole,
  UserManagementError
>;
export type UserManagementRolesResult = Result<
  UserManagementRole[],
  UserManagementError
>;
export type AccountMemberResult = Result<AccountMember, UserManagementError>;
export type AccountMembersResult = Result<AccountMember[], UserManagementError>;
export type AccountMemberWithRoleResult = Result<
  AccountMemberWithRole,
  UserManagementError
>;
export type AccountMembersWithRoleResult = Result<
  AccountMemberWithRole[],
  UserManagementError
>;
export type AccountUserRoleAssignmentResult = Result<
  AccountUserRoleAssignment,
  UserManagementError
>;
export type UserManagementOperationResult = Result<boolean, UserManagementError>;
export type AccountPermissionCodesResult = Result<string[], UserManagementError>;
export type AccountRemoteIdsResult = Result<string[], UserManagementError>;
export type UserManagementSnapshotResult = Result<
  UserManagementSnapshot,
  UserManagementError
>;
