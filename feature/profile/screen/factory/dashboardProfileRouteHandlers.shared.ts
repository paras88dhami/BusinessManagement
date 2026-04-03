import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import {
  DashboardHomePath,
  getDashboardHomePath,
} from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

type DashboardProfileReplacePath = DashboardHomePath | "/(dashboard)/profile";

export type DashboardProfileRouteHandlers = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  onLogout: () => Promise<void>;
  onBackToHome: () => void;
};

type DashboardProfileRouteHandlerParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountType: AccountTypeValue | null;
  navigateReplace: (targetPath: DashboardProfileReplacePath) => void;
  clearUserSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const createDashboardProfileRouteHandlers = (
  params: DashboardProfileRouteHandlerParams,
): DashboardProfileRouteHandlers => {
  const {
    activeUserRemoteId,
    activeAccountRemoteId,
    activeAccountType,
    navigateReplace,
    clearUserSession,
    refreshSession,
  } = params;

  return {
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome: (accountType: AccountTypeValue) => {
      navigateReplace(getDashboardHomePath(accountType));
    },
    onLogout: async () => {
      try {
        await clearUserSession();
        await refreshSession();
      } catch {
        return;
      }
    },
    onBackToHome: () => {
      navigateReplace(getDashboardHomePath(activeAccountType));
    },
  };
};
