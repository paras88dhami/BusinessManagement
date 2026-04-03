import {
  ChangeAccountMemberStatusPayload,
  UserManagementOperationResult,
} from "../types/userManagement.types";

export interface ChangeAccountMemberStatusUseCase {
  execute(
    payload: ChangeAccountMemberStatusPayload,
  ): Promise<UserManagementOperationResult>;
}
