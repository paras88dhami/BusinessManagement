import { AccountRoleModel } from "./accountRole.model";
import { accountRolesTable } from "./accountRole.schema";
import { AccountMemberModel } from "./accountMember.model";
import { accountMembersTable } from "./accountMember.schema";
import { AccountRolePermissionModel } from "./accountRolePermission.model";
import { accountRolePermissionsTable } from "./accountRolePermission.schema";
import { AccountUserRoleModel } from "./accountUserRole.model";
import { accountUserRolesTable } from "./accountUserRole.schema";
import { UserManagementPermissionModel } from "./userManagementPermission.model";
import { userManagementPermissionsTable } from "./userManagementPermission.schema";

export const userManagementDbConfig = {
  models: [
    UserManagementPermissionModel,
    AccountRoleModel,
    AccountMemberModel,
    AccountRolePermissionModel,
    AccountUserRoleModel,
  ],
  tables: [
    userManagementPermissionsTable,
    accountRolesTable,
    accountMembersTable,
    accountRolePermissionsTable,
    accountUserRolesTable,
  ],
};
