import {
  AccountMemberWithRole,
  UserManagementPermission,
  UserManagementRole,
} from "../types/userManagement.types";
import {
  UserManagementMemberEditorState,
  UserManagementRoleEditorState,
} from "./userManagement.state";

export type UserManagementSummaryCard = {
  id: "total" | "active" | "inactive";
  label: string;
  value: number;
  tone: "neutral" | "success" | "danger";
};

export type UserManagementRoleFilter = {
  key: string;
  label: string;
};

export type UserManagementMemberListItem = {
  memberRemoteId: string;
  userRemoteId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  statusText: string;
  joinedAtLabel: string;
  roleLabel: string;
  isActive: boolean;
  isAccountOwner: boolean;
  canEdit: boolean;
  canToggleStatus: boolean;
  canDelete: boolean;
};

export type UserManagementRoleListItem = {
  roleRemoteId: string;
  name: string;
  permissionCount: number;
  assignedMemberCount: number;
  isSystem: boolean;
  isDefault: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export interface UserManagementViewModel {
  isLoading: boolean;
  isSavingMember: boolean;
  isUpdatingMemberStatus: boolean;
  isDeletingMember: boolean;
  isSavingRole: boolean;
  isDeletingRole: boolean;
  members: readonly AccountMemberWithRole[];
  roles: readonly UserManagementRole[];
  permissions: readonly UserManagementPermission[];
  assignedRoleRemoteId: string | null;
  grantedPermissionCodes: readonly string[];
  searchQuery: string;
  selectedRoleFilterKey: string;
  summaryCards: readonly UserManagementSummaryCard[];
  roleFilters: readonly UserManagementRoleFilter[];
  memberListItems: readonly UserManagementMemberListItem[];
  roleListItems: readonly UserManagementRoleListItem[];
  memberEditor: UserManagementMemberEditorState;
  roleEditor: UserManagementRoleEditorState;
  canManageStaff: boolean;
  canManageRoles: boolean;
  canAssignRoles: boolean;
  screenError?: string;
  screenSuccess?: string;
  onChangeSearchQuery: (searchQuery: string) => void;
  onSelectRoleFilter: (filterKey: string) => void;
  onReload: () => Promise<void>;
  onStartCreateMember: () => void;
  onStartEditMember: (memberRemoteId: string) => void;
  onCancelMemberEditor: () => void;
  onChangeMemberFullName: (fullName: string) => void;
  onChangeMemberPhone: (phone: string) => void;
  onChangeMemberEmail: (email: string) => void;
  onChangeMemberPassword: (password: string) => void;
  onChangeMemberRole: (roleRemoteId: string) => void;
  onSaveMember: () => Promise<void>;
  onToggleMemberStatus: (
    memberRemoteId: string,
    nextStatus: "active" | "inactive",
  ) => Promise<void>;
  onDeleteMember: (memberRemoteId: string) => Promise<void>;
  onStartCreateRole: () => void;
  onStartEditRole: (roleRemoteId: string) => void;
  onDeleteRole: (roleRemoteId: string) => Promise<void>;
  onCancelRoleEditor: () => void;
  onChangeRoleName: (roleName: string) => void;
  onToggleRolePermission: (permissionCode: string) => void;
  onSaveRole: () => Promise<void>;
  onBack: () => void;
}

export type UseUserManagementViewModelParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onBack: () => void;
};
