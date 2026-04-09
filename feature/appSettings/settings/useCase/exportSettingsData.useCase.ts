import {
  ExportSettingsDataResult,
  SettingsDataTransferFormatValue,
  SettingsDataTransferModuleValue,
} from "@/feature/appSettings/settings/types/settings.types";

export type ExportSettingsDataPayload = {
  format: SettingsDataTransferFormatValue;
  moduleIds: readonly SettingsDataTransferModuleValue[];
};

export interface ExportSettingsDataUseCase {
  execute(payload: ExportSettingsDataPayload): Promise<ExportSettingsDataResult>;
}

