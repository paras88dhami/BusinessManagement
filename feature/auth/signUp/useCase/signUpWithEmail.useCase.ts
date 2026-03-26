import { SignUpInput, SignUpResult } from "../types/signUp.types";

export interface SignUpWithEmailUseCase {
  signUp(payload: SignUpInput): Promise<SignUpResult>;
}
