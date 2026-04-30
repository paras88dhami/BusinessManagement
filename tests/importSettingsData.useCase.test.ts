import { SETTINGS_IMPORT_DISABLED_MESSAGE } from "@/feature/appSettings/settings/constants/settings.constants";
import { SettingsDataTransferModule } from "@/feature/appSettings/settings/types/settings.types";
import { createImportSettingsDataUseCase } from "@/feature/appSettings/settings/useCase/importSettingsData.useCase.impl";
import { describe, expect, it, vi } from "vitest";

describe("importSettingsData.useCase", () => {
  it("disables data import for v1", async () => {
    const importDataBundle = vi.fn();
    const useCase = createImportSettingsDataUseCase({
      importDataBundle,
    } as never);

    const result = await useCase.execute({
      moduleId: SettingsDataTransferModule.Products,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(SETTINGS_IMPORT_DISABLED_MESSAGE);
    }
    expect(importDataBundle).not.toHaveBeenCalled();
  });
});
