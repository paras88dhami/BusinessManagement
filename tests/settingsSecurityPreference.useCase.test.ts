import { createUpdateBiometricLoginPreferenceUseCase } from "@/feature/appSettings/settings/useCase/updateBiometricLoginPreference.useCase.impl";
import { createUpdateTwoFactorAuthPreferenceUseCase } from "@/feature/appSettings/settings/useCase/updateTwoFactorAuthPreference.useCase.impl";
import { describe, expect, it, vi } from "vitest";

describe("settings security preference use cases", () => {
  it("does not allow enabling unsupported biometric login", async () => {
    const updateBiometricLoginEnabled = vi.fn(async () => ({
      success: true as const,
      value: true,
    }));

    const useCase = createUpdateBiometricLoginPreferenceUseCase({
      updateBiometricLoginEnabled,
    } as never);

    const result = await useCase.execute(true);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Coming soon.");
    }
    expect(updateBiometricLoginEnabled).not.toHaveBeenCalled();
  });

  it("does not allow enabling unsupported two-factor auth", async () => {
    const updateTwoFactorAuthEnabled = vi.fn(async () => ({
      success: true as const,
      value: true,
    }));

    const useCase = createUpdateTwoFactorAuthPreferenceUseCase({
      updateTwoFactorAuthEnabled,
    } as never);

    const result = await useCase.execute(true);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Coming soon.");
    }
    expect(updateTwoFactorAuthEnabled).not.toHaveBeenCalled();
  });
});
