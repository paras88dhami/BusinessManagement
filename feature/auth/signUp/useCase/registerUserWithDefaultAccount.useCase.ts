import { SignUpInput, SignUpResult } from "../types/signUp.types";

export interface RegisterUserWithDefaultAccountUseCase {
  execute(payload: SignUpInput): Promise<SignUpResult>;
}
