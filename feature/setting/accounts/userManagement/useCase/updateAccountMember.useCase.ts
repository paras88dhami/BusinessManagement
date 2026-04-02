import {
  AccountMemberWithRoleResult,
  UpdateAccountMemberPayload,
} from "../types/userManagement.types";

export interface UpdateAccountMemberUseCase {
  execute(payload: UpdateAccountMemberPayload): Promise<AccountMemberWithRoleResult>;
}
