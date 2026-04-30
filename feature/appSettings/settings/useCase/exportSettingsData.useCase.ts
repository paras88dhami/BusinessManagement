import {
  ExportSettingsDataResult,
  SettingsDataTransferFormatValue,
  SettingsDataTransferModuleValue,
} from "@/feature/appSettings/settings/types/settings.types";
import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";

export type ExportSettingsDataPayload = {
  format: SettingsDataTransferFormatValue;
  moduleIds: readonly SettingsDataTransferModuleValue[];
  activeUserRemoteId: string;
  activeAccountRemoteId: string;
  activeAccountType: AccountTypeValue;
};

export interface ExportSettingsDataUseCase {
  execute(payload: ExportSettingsDataPayload): Promise<ExportSettingsDataResult>;
}
