import { AuthCredentialRepository } from "../data/repository/authCredential.repository";
import {
  AuthCredentialResult,
  AuthSessionValidationError,
  CredentialType,
  CredentialTypeValue,
} from "../types/authSession.types";
import { GetActiveAuthCredentialByLoginIdUseCase } from "./getActiveAuthCredentialByLoginId.useCase";

export const createGetActiveAuthCredentialByLoginIdUseCase = (
  authCredentialRepository: AuthCredentialRepository,
): GetActiveAuthCredentialByLoginIdUseCase => ({
  async execute(
    loginId: string,
    credentialType: CredentialTypeValue = CredentialType.Password,
  ): Promise<AuthCredentialResult> {
    const normalizedLoginId = loginId.trim();

    if (!normalizedLoginId) {
      return {
        success: false,
        error: AuthSessionValidationError("Login id is required."),
      };
    }

    return authCredentialRepository.getActiveAuthCredentialByLoginId(
      normalizedLoginId,
      credentialType,
    );
  },
});
