import { SignUpInput, SignUpResult } from "../../types/signUp.types";

export interface SignUpRepository {
  signUpWithEmail(payload: SignUpInput): Promise<SignUpResult>;
}
