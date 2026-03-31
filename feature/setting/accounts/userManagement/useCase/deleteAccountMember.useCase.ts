import {
  DeleteAccountMemberPayload,
  UserManagementOperationResult,
} from "../types/userManagement.types";

export interface DeleteAccountMemberUseCase {
  execute(payload: DeleteAccountMemberPayload): Promise<UserManagementOperationResult>;
}

