import {
  ImportSettingsDataResult,
  SettingsDataTransferModuleValue,
} from "@/feature/appSettings/settings/types/settings.types";

export type ImportSettingsDataPayload = {
  moduleId: SettingsDataTransferModuleValue;
};

export interface ImportSettingsDataUseCase {
  execute(payload: ImportSettingsDataPayload): Promise<ImportSettingsDataResult>;
}

