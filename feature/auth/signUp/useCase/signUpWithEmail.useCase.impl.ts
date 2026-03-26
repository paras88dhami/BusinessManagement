import { SignUpRepository } from "../data/repositiory/signUp.repository";
import { SignUpInput, SignUpResult } from "../types/signUp.types";
import { SignUpWithEmailUseCase } from "./signUpWithEmail.useCase";

export const createSignUpWithEmailUseCase = (
  repository: SignUpRepository,
): SignUpWithEmailUseCase => ({
  signUp: async (payload: SignUpInput): Promise<SignUpResult> => {
    return repository.signUpWithEmail(payload);
  },
});
