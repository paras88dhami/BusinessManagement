import {
  AccountMemberWithRoleResult,
  CreateAccountMemberPayload,
} from "../types/userManagement.types";

export interface CreateAccountMemberUseCase {
  execute(payload: CreateAccountMemberPayload): Promise<AccountMemberWithRoleResult>;
}
