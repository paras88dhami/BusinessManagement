import { VerifiedLocalCredential } from "@/feature/session/types/authSession.types";
import { RegisterUserWithDefaultAccountUseCase } from "../../useCase/registerUserWithDefaultAccount.useCase";
import { SignUpRepository } from "./signUp.repository";
import { DatabaseError, SignUpInput, SignUpResult } from "../../types/signUp.types";

type LocalSignUpRepositoryOptions = {
  onRegistered: (
    verifiedCredential: VerifiedLocalCredential,
    payload: SignUpInput,
  ) => Promise<void> | void;
};

export const createLocalSignUpRepository = (
  registerUserWithDefaultAccountUseCase: RegisterUserWithDefaultAccountUseCase,
  options: LocalSignUpRepositoryOptions,
): SignUpRepository => ({
  async signUpWithEmail(payload): Promise<SignUpResult> {
    const registrationResult =
      await registerUserWithDefaultAccountUseCase.execute(payload);

    if (!registrationResult.success) {
      return registrationResult;
    }

    try {
      await options.onRegistered(registrationResult.value, payload);
    } catch {
      return {
        success: false,
        error: DatabaseError,
      };
    }

    return registrationResult;
  },
});
