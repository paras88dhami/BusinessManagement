import { SaveAccountUseCase } from "@/feature/auth/accountSelection/useCase/saveAccount.useCase";
import { SaveBusinessProfileUseCase } from "@/feature/profile/business/useCase/saveBusinessProfile.useCase";
import {
    EditableBusinessProfile,
    ProfileScreenData,
} from "@/feature/profile/screen/types/profileScreen.types";

export type UseProfileBusinessEditorViewModelParams = {
  activeUserRemoteId: string | null;
  data: ProfileScreenData;
  saveAccountUseCase: SaveAccountUseCase;
  saveBusinessProfileUseCase: SaveBusinessProfileUseCase;
  onUpdateData: (
    updater: (previousData: ProfileScreenData) => ProfileScreenData,
  ) => void;
  setLoadError: (nextError: string | null) => void;
  setSuccessMessage: (nextMessage: string | null) => void;
};

export interface ProfileBusinessEditorViewModel {
  activeBusinessProfileForm: EditableBusinessProfile;
  hasActiveBusinessProfile: boolean;
  isBusinessEditing: boolean;
  isSavingBusinessProfile: boolean;
  onStartBusinessEdit: () => void;
  onCancelBusinessEdit: () => void;
  onUpdateBusinessProfileField: (
    field: keyof EditableBusinessProfile,
    value: string,
  ) => void;
  onSaveBusinessProfile: () => Promise<void>;
}
