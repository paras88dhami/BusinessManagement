import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { ProfileScreenData } from "@/feature/profile/screen/types/profileScreen.types";

export type UseProfileAccountSwitchViewModelParams = {
  setActiveAccountSession: (accountRemoteId: string) => Promise<void>;
  data: ProfileScreenData;
  onUpdateData: (
    updater: (previousData: ProfileScreenData) => ProfileScreenData,
  ) => void;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  setLoadError: (nextError: string | null) => void;
  clearSuccessMessage: () => void;
};

export interface ProfileAccountSwitchViewModel {
  isSwitchExpanded: boolean;
  onToggleSwitchExpanded: () => void;
  onSelectAccount: (accountRemoteId: string) => Promise<void>;
}
