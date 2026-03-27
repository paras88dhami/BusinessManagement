import { Result } from "@/shared/types/result.types";
import { SaveAuthUserPayload } from "../../types/authSession.types";
import { AuthUserModel } from "./db/authUser.model";

export interface AuthUserDatasource {
  saveAuthUser(payload: SaveAuthUserPayload): Promise<Result<AuthUserModel>>;
  getAuthUserByRemoteId(remoteId: string): Promise<Result<AuthUserModel>>;
  getAllAuthUsers(): Promise<Result<AuthUserModel[]>>;
  deleteAuthUserByRemoteId(remoteId: string): Promise<Result<boolean>>;
  clearAllAuthUsers(): Promise<Result<boolean>>;
}
