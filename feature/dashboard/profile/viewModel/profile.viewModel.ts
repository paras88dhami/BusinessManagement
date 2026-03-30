import { Database } from "@nozbe/watermelondb";
import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { ProfileAccountOption } from "../types/profile.types";

export interface DashboardProfileViewModel {
  isLoading: boolean;
  loadError?: string;
  profileName: string;
  roleLabel: string;
  initials: string;
  activeAccountDisplayName: string;
  activeAccountTypeLabel: string;
  activeAccountRemoteId: string | null;
  accountOptions: readonly ProfileAccountOption[];
  isSwitchExpanded: boolean;
  onToggleSwitchExpanded: () => void;
  onSelectAccount: (accountRemoteId: string) => Promise<void>;
  onSwitchAccountViaSelector: () => void;
  onLogout: () => Promise<void>;
  onBack: () => void;
}

export type UseDashboardProfileViewModelParams = {
  database: Database;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  onSwitchAccountViaSelector: () => void;
  onLogout: () => Promise<void>;
  onBack: () => void;
};
