import {
  ResolveAccountPermissionCodesPayload,
  UserManagementSnapshotResult,
} from "../types/userManagement.types";

export interface GetUserManagementSnapshotUseCase {
  execute(
    payload: ResolveAccountPermissionCodesPayload,
  ): Promise<UserManagementSnapshotResult>;
}
