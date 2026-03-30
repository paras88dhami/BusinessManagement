import React, { useCallback } from "react";
import { GetPersonalDashboardScreenFactory } from "@/feature/dashboard/personal/factory/getPersonalDashboardScreen.factory";
import {
  DashboardTab,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import {
  getDashboardTabItems,
  getDashboardTabPath,
} from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function PersonalDashboardRoute() {
  const navigation = useSmoothNavigation();
  const { activeAccountType, profileInitials } = useDashboardRouteContext();

  const handleTabPress = useCallback(
    (tab: DashboardTabValue) => {
      const targetPath = getDashboardTabPath(tab, activeAccountType);
      navigation.replace(targetPath);
    },
    [activeAccountType, navigation],
  );

  const handleProfilePress = useCallback(() => {
    navigation.push("/(dashboard)/profile");
  }, [navigation]);

  return (
    <GetPersonalDashboardScreenFactory
      profileInitials={profileInitials}
      activeTab={DashboardTab.Home}
      tabItems={getDashboardTabItems(activeAccountType)}
      onTabPress={handleTabPress}
      onProfilePress={handleProfilePress}
    />
  );
}
