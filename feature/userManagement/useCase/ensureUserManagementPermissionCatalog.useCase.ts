import { UserManagementOperationResult } from "../types/userManagement.types";

export interface EnsureUserManagementPermissionCatalogUseCase {
  execute(): Promise<UserManagementOperationResult>;
}
