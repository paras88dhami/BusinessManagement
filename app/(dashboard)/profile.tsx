import React, { useCallback } from "react";
import appDatabase from "@/shared/database/appDatabase";
import {
  clearActiveUserSession,
} from "@/feature/appSettings/data/appSettings.store";
import { GetDashboardProfileScreenFactory } from "@/feature/dashboard/profile/factory/getDashboardProfileScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { useAppRouteSession } from "@/feature/session/ui/AppRouteSessionProvider";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";

export default function DashboardProfileRoute() {
  const navigation = useSmoothNavigation();
  const dashboardContext = useDashboardRouteContext();
  const { refreshSession } = useAppRouteSession();

  const handleNavigateHome = useCallback(
    (accountType: AccountTypeValue) => {
      navigation.replace(getDashboardHomePath(accountType));
    },
    [navigation],
  );

  const handleSwitchAccountViaSelector = useCallback(() => {
    navigation.replace("/(account-setup)/select-account");
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    try {
      await clearActiveUserSession(appDatabase);
      await refreshSession();
    } catch (error) {
      console.error("Failed to clear session during logout.", error);
    }
  }, [refreshSession]);

  const handleBack = useCallback(() => {
    navigation.replace(getDashboardHomePath(dashboardContext.activeAccountType));
  }, [dashboardContext.activeAccountType, navigation]);

  return (
    <GetDashboardProfileScreenFactory
      database={appDatabase}
      activeUserRemoteId={dashboardContext.activeUserRemoteId}
      activeAccountRemoteId={dashboardContext.activeAccountRemoteId}
      onNavigateHome={handleNavigateHome}
      onSwitchAccountViaSelector={handleSwitchAccountViaSelector}
      onLogout={handleLogout}
      onBack={handleBack}
    />
  );
}
