import { AuthCredentialRepository } from "../data/repository/authCredential.repository";
import {
  AuthCredentialResult,
  AuthSessionValidationError,
  SaveAuthCredentialPayload,
} from "../types/authSession.types";
import { SaveAuthCredentialUseCase } from "./saveAuthCredential.useCase";

export const createSaveAuthCredentialUseCase = (
  authCredentialRepository: AuthCredentialRepository,
): SaveAuthCredentialUseCase => ({
  async execute(
    payload: SaveAuthCredentialPayload,
  ): Promise<AuthCredentialResult> {
    const normalizedPayload: SaveAuthCredentialPayload = {
      ...payload,
      remoteId: payload.remoteId.trim(),
      userRemoteId: payload.userRemoteId.trim(),
      loginId: payload.loginId.trim(),
      passwordHash: payload.passwordHash.trim(),
      passwordSalt: payload.passwordSalt.trim(),
      hint: payload.hint?.trim() ? payload.hint.trim() : null,
    };

    if (!normalizedPayload.remoteId) {
      return {
        success: false,
        error: AuthSessionValidationError("Remote id is required."),
      };
    }

    if (!normalizedPayload.userRemoteId) {
      return {
        success: false,
        error: AuthSessionValidationError("User remote id is required."),
      };
    }

    if (!normalizedPayload.loginId) {
      return {
        success: false,
        error: AuthSessionValidationError("Login id is required."),
      };
    }

    if (!normalizedPayload.passwordHash) {
      return {
        success: false,
        error: AuthSessionValidationError("Password hash is required."),
      };
    }

    if (!normalizedPayload.passwordSalt) {
      return {
        success: false,
        error: AuthSessionValidationError("Password salt is required."),
      };
    }

    return authCredentialRepository.saveAuthCredential(normalizedPayload);
  },
});
