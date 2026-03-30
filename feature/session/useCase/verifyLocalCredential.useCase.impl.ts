import { PasswordHashService } from "@/shared/utils/auth/passwordHash.service";
import { AuthCredentialRepository } from "../data/repository/authCredential.repository";
import { AuthUserRepository } from "../data/repository/authUser.repository";
import {
  CredentialType,
  InvalidCredentialsError,
  TooManyAttemptsError,
  VerifiedLocalCredentialResult,
  VerifyLocalCredentialPayload,
} from "../types/authSession.types";
import { VerifyLocalCredentialUseCase } from "./verifyLocalCredential.useCase";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export const createVerifyLocalCredentialUseCase = (
  authCredentialRepository: AuthCredentialRepository,
  authUserRepository: AuthUserRepository,
  passwordHashService: PasswordHashService,
): VerifyLocalCredentialUseCase => ({
  async execute(
    payload: VerifyLocalCredentialPayload,
  ): Promise<VerifiedLocalCredentialResult> {
    const normalizedLoginId = payload.loginId;
    const password = payload.password;

    const authCredentialResult =
      await authCredentialRepository.getActiveAuthCredentialByLoginId(
        normalizedLoginId,
        CredentialType.Password,
      );

    if (!authCredentialResult.success) {
      return authCredentialResult;
    }

    const authCredential = authCredentialResult.value;
    const now = Date.now();

    if (
      authCredential.lockoutUntil !== null &&
      authCredential.lockoutUntil > now
    ) {
      return {
        success: false,
        error: TooManyAttemptsError(),
      };
    }

    const isPasswordValid = await passwordHashService.compare(
      password,
      authCredential.passwordSalt,
      authCredential.passwordHash,
    );

    if (!isPasswordValid) {
      const hasLockoutExpired =
        authCredential.lockoutUntil !== null && authCredential.lockoutUntil <= now;
      const baselineFailedAttemptCount = hasLockoutExpired
        ? 0
        : authCredential.failedAttemptCount;
      const nextFailedAttemptCount = baselineFailedAttemptCount + 1;
      const shouldLockAccount = nextFailedAttemptCount >= MAX_FAILED_ATTEMPTS;
      const lockoutUntil = shouldLockAccount ? now + LOCKOUT_DURATION_MS : null;

      const failedAttemptResult =
        await authCredentialRepository.recordFailedLoginAttemptByRemoteId(
          authCredential.remoteId,
          shouldLockAccount ? MAX_FAILED_ATTEMPTS : nextFailedAttemptCount,
          lockoutUntil,
          now,
        );

      if (!failedAttemptResult.success) {
        return failedAttemptResult;
      }

      const updatedCredential = failedAttemptResult.value;

      if (
        updatedCredential.lockoutUntil !== null &&
        updatedCredential.lockoutUntil > now
      ) {
        return {
          success: false,
          error: TooManyAttemptsError(),
        };
      }

      return {
        success: false,
        error: InvalidCredentialsError,
      };
    }

    const [markLoginSuccessResult, authUserResult] = await Promise.all([
      authCredentialRepository.markLoginSuccessByRemoteId(
        authCredential.remoteId,
        now,
      ),
      authUserRepository.getAuthUserByRemoteId(authCredential.userRemoteId),
    ]);

    if (!markLoginSuccessResult.success) {
      return markLoginSuccessResult;
    }

    if (!authUserResult.success) {
      return authUserResult;
    }

    if (passwordHashService.needsRehash(authCredential.passwordHash)) {
      void (async () => {
        try {
          const nextPasswordHash = await passwordHashService.hash(
            password,
            authCredential.passwordSalt,
          );

          await authCredentialRepository.saveAuthCredential({
            remoteId: authCredential.remoteId,
            userRemoteId: authCredential.userRemoteId,
            loginId: authCredential.loginId,
            credentialType: authCredential.credentialType,
            passwordHash: nextPasswordHash,
            passwordSalt: authCredential.passwordSalt,
            hint: authCredential.hint,
            isActive: authCredential.isActive,
          });
        } catch (error) {
          console.error("Failed to rehash credential in background.", error);
        }
      })();
    }

    return {
      success: true,
      value: {
        authUser: authUserResult.value,
        authCredential: {
          ...authCredential,
          lastLoginAt: now,
          failedAttemptCount: 0,
          lockoutUntil: null,
          lastFailedLoginAt: null,
        },
      },
    };
  },
});
