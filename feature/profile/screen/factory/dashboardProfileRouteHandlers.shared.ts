import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";
import {
    DashboardHomePath,
    getDashboardHomePath,
} from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

type DashboardProfileReplacePath = DashboardHomePath | "/(dashboard)/profile";
type DashboardProfilePushPath = "/(dashboard)/settings";

export type DashboardProfileRouteHandlers = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onNavigateHome: (accountType: AccountTypeValue) => void;
  onOpenSettings: () => void;
  onLogout: () => Promise<void>;
  onBackToHome: () => void;
};

type DashboardProfileRouteHandlerParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountType: AccountTypeValue | null;
  navigateReplace: (targetPath: DashboardProfileReplacePath) => void;
  navigatePush: (targetPath: DashboardProfilePushPath) => void;
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
    navigatePush,
    clearUserSession,
    refreshSession,
  } = params;

  return {
    activeUserRemoteId,
    activeAccountRemoteId,
    onNavigateHome: (accountType: AccountTypeValue) => {
      navigateReplace(getDashboardHomePath(accountType));
    },
    onOpenSettings: () => {
      navigatePush("/(dashboard)/settings");
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
