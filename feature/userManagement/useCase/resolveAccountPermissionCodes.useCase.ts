import {
  AccountPermissionCodesResult,
  ResolveAccountPermissionCodesPayload,
} from "../types/userManagement.types";

export interface ResolveAccountPermissionCodesUseCase {
  execute(
    payload: ResolveAccountPermissionCodesPayload,
  ): Promise<AccountPermissionCodesResult>;
}
