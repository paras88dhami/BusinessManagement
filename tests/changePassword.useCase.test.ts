import { CredentialType } from "@/feature/session/types/authSession.types";
import { createChangePasswordUseCase } from "@/feature/appSettings/settings/useCase/changePassword.useCase.impl";
import { describe, expect, it, vi } from "vitest";

const buildCredential = () => ({
  remoteId: "cred-1",
  userRemoteId: "user-1",
  loginId: "owner@example.com",
  credentialType: CredentialType.Password,
  passwordHash: "current-hash",
  passwordSalt: "current-salt",
  hint: null,
  lastLoginAt: null,
  isActive: true,
  failedAttemptCount: 0,
  lockoutUntil: null,
  lastFailedLoginAt: null,
  createdAt: 1_710_000_000_000,
  updatedAt: 1_710_000_000_000,
});

describe("changePassword.useCase", () => {
  it("changes the password when the current password is valid", async () => {
    const authCredentialRepository = {
      getAuthCredentialByUserRemoteId: vi.fn(async () => ({
        success: true as const,
        value: buildCredential(),
      })),
      saveAuthCredential: vi.fn(async (payload) => ({
        success: true as const,
        value: {
          ...buildCredential(),
          ...payload,
          updatedAt: 1_710_000_000_123,
        },
      })),
    };
    const passwordHashService = {
      compare: vi.fn(async () => true),
      generateSalt: vi.fn(async () => "next-salt"),
      hash: vi.fn(async () => "next-hash"),
    };

    const useCase = createChangePasswordUseCase(
      authCredentialRepository as never,
      passwordHashService as never,
    );

    const result = await useCase.execute({
      userRemoteId: "user-1",
      currentPassword: "currentPass1",
      nextPassword: "nextPass123",
      confirmPassword: "nextPass123",
    });

    expect(result).toEqual({ success: true, value: true });
    expect(passwordHashService.compare).toHaveBeenCalledWith(
      "currentPass1",
      "current-salt",
      "current-hash",
    );
    expect(authCredentialRepository.saveAuthCredential).toHaveBeenCalledWith(
      expect.objectContaining({
        remoteId: "cred-1",
        passwordSalt: "next-salt",
        passwordHash: "next-hash",
      }),
    );
  });

  it("rejects a new password that matches the current password", async () => {
    const useCase = createChangePasswordUseCase(
      {
        getAuthCredentialByUserRemoteId: vi.fn(),
        saveAuthCredential: vi.fn(),
      } as never,
      {
        compare: vi.fn(),
        generateSalt: vi.fn(),
        hash: vi.fn(),
      } as never,
    );

    const result = await useCase.execute({
      userRemoteId: "user-1",
      currentPassword: "samePassword",
      nextPassword: "samePassword",
      confirmPassword: "samePassword",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "New password must be different from the current password.",
      );
    }
  });

  it("rejects a password shorter than the minimum length", async () => {
    const useCase = createChangePasswordUseCase(
      {
        getAuthCredentialByUserRemoteId: vi.fn(),
        saveAuthCredential: vi.fn(),
      } as never,
      {
        compare: vi.fn(),
        generateSalt: vi.fn(),
        hash: vi.fn(),
      } as never,
    );

    const result = await useCase.execute({
      userRemoteId: "user-1",
      currentPassword: "currentPass1",
      nextPassword: "short1",
      confirmPassword: "short1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("at least 8 characters");
    }
  });

  it("rejects a confirmation mismatch", async () => {
    const useCase = createChangePasswordUseCase(
      {
        getAuthCredentialByUserRemoteId: vi.fn(),
        saveAuthCredential: vi.fn(),
      } as never,
      {
        compare: vi.fn(),
        generateSalt: vi.fn(),
        hash: vi.fn(),
      } as never,
    );

    const result = await useCase.execute({
      userRemoteId: "user-1",
      currentPassword: "currentPass1",
      nextPassword: "nextPass123",
      confirmPassword: "nextPass124",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "New password and confirm password must match.",
      );
    }
  });
});
