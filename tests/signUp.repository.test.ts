import { createLocalSignUpRepository } from "@/feature/auth/signUp/data/repository/signUp.repository.impl";
import {
  SignUpErrorType,
  SignUpInput,
  SignUpProfileType,
} from "@/feature/auth/signUp/types/signUp.types";
import { RegisterUserWithDefaultAccountUseCase } from "@/feature/auth/signUp/useCase/registerUserWithDefaultAccount.useCase";
import { describe, expect, it, vi } from "vitest";

const SIGN_UP_PAYLOAD: SignUpInput = {
  fullName: "Test User",
  phoneNumber: "+9779800000000",
  password: "secret123",
  profileType: SignUpProfileType.Personal,
  businessType: null,
};

const VERIFIED_CREDENTIAL = {
  authUser: {
    remoteId: "user-1",
    fullName: "Test User",
    email: null,
    phone: "+9779800000000",
    authProvider: null,
    profileImageUrl: null,
    preferredLanguage: null,
    isEmailVerified: false,
    isPhoneVerified: false,
    createdAt: 1,
    updatedAt: 1,
  },
  authCredential: {
    remoteId: "cred-1",
    userRemoteId: "user-1",
    loginId: "+9779800000000",
    credentialType: "password",
    passwordHash: "hash",
    passwordSalt: "salt",
    hint: null,
    isActive: true,
    failedAttemptCount: 0,
    lockoutUntil: null,
    lastAuthenticatedAt: null,
    createdAt: 1,
    updatedAt: 1,
  },
} as const;

describe("signUp.repository", () => {
  it("returns session activation failure when user is created but onRegistered fails", async () => {
    const registerUseCase: RegisterUserWithDefaultAccountUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: VERIFIED_CREDENTIAL as never,
      })),
    };

    const repository = createLocalSignUpRepository(registerUseCase, {
      onRegistered: async () => {
        throw new Error("Session write failed.");
      },
    });

    const result = await repository.signUpWithEmail(SIGN_UP_PAYLOAD);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.type).toBe(SignUpErrorType.SessionActivationFailed);
    expect(result.error.message).toContain("Session write failed.");
    expect(result.error.message).toContain("Please log in");
  });

  it("returns success when registration and onRegistered both succeed", async () => {
    const registerUseCase: RegisterUserWithDefaultAccountUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: VERIFIED_CREDENTIAL as never,
      })),
    };
    const onRegisteredMock = vi.fn(async () => {});

    const repository = createLocalSignUpRepository(registerUseCase, {
      onRegistered: onRegisteredMock,
    });

    const result = await repository.signUpWithEmail(SIGN_UP_PAYLOAD);

    expect(result.success).toBe(true);
    expect(onRegisteredMock).toHaveBeenCalledTimes(1);
  });
});

