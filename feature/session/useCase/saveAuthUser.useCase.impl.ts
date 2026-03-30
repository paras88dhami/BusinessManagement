import { AuthUserRepository } from "../data/repository/authUser.repository";
import {
    AuthSessionValidationError,
    AuthUserResult,
    SaveAuthUserPayload,
} from "../types/authSession.types";
import { SaveAuthUserUseCase } from "./saveAuthUser.useCase";

export const createSaveAuthUserUseCase = (
  authUserRepository: AuthUserRepository,
): SaveAuthUserUseCase => ({
  async execute(payload: SaveAuthUserPayload): Promise<AuthUserResult> {
    const normalizedPayload: SaveAuthUserPayload = {
      ...payload,
      remoteId: payload.remoteId.trim(),
      fullName: payload.fullName.trim(),
      email: payload.email?.trim() ? payload.email.trim() : null,
      phone: payload.phone?.trim() ? payload.phone.trim() : null,
      authProvider: payload.authProvider?.trim()
        ? payload.authProvider.trim()
        : null,
      profileImageUrl: payload.profileImageUrl?.trim()
        ? payload.profileImageUrl.trim()
        : null,
      preferredLanguage: payload.preferredLanguage?.trim()
        ? payload.preferredLanguage.trim()
        : null,
    };

    if (!normalizedPayload.remoteId) {
      return {
        success: false,
        error: AuthSessionValidationError("Remote id is required."),
      };
    }

    if (!normalizedPayload.fullName) {
      return {
        success: false,
        error: AuthSessionValidationError("Full name is required."),
      };
    }

    if (normalizedPayload.fullName.length < 2) {
      return {
        success: false,
        error: AuthSessionValidationError(
          "Full name must be at least 2 characters.",
        ),
      };
    }

    return authUserRepository.saveAuthUser(normalizedPayload);
  },
});
