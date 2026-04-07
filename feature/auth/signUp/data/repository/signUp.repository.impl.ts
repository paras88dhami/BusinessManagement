import { VerifiedLocalCredential } from "@/feature/session/types/authSession.types";
import { RegisterUserWithDefaultAccountUseCase } from "../../useCase/registerUserWithDefaultAccount.useCase";
import { SignUpRepository } from "./signUp.repository";
import { SessionActivationFailedError, SignUpInput, SignUpResult } from "../../types/signUp.types";

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
    } catch (error) {
      const activationErrorMessage =
        error instanceof Error && error.message.trim().length > 0
          ? `${error.message.trim()} Please log in with the phone number and password you just created.`
          : undefined;

      return {
        success: false,
        error: SessionActivationFailedError(activationErrorMessage),
      };
    }

    return registrationResult;
  },
});
