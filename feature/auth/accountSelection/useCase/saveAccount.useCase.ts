import {
  AccountResult,
  SaveAccountPayload,
} from "../types/accountSelection.types";

export interface SaveAccountUseCase {
  execute(payload: SaveAccountPayload): Promise<AccountResult>;
}
