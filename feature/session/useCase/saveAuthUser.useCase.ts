import {
  AuthUserResult,
  SaveAuthUserPayload,
} from "../types/authSession.types";

export interface SaveAuthUserUseCase {
  execute(payload: SaveAuthUserPayload): Promise<AuthUserResult>;
}
