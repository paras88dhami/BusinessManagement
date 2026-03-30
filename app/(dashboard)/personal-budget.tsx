import React, { useCallback } from "react";
import {
  DashboardTab,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import {
  getDashboardTabItems,
  getDashboardTabPath,
} from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import {
  DashboardInfoCard,
  DashboardTabScaffold,
} from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function PersonalBudgetDashboardRoute() {
  const navigation = useSmoothNavigation();
  const { activeAccountType } = useDashboardRouteContext();

  const handleTabPress = useCallback(
    (tab: DashboardTabValue) => {
      const targetPath = getDashboardTabPath(tab, activeAccountType);
      navigation.replace(targetPath);
    },
    [activeAccountType, navigation],
  );

  return (
    <DashboardTabScaffold
      title="Budget"
      activeTab={DashboardTab.Budget}
      tabItems={getDashboardTabItems(activeAccountType)}
      onTabPress={handleTabPress}
    >
      <DashboardInfoCard
        title="Personal Budget"
        description="Set monthly spending limits and monitor category-wise usage in personal mode from this tab."
      />
      <DashboardInfoCard
        title="Next"
        description="Connect budget goals, alerts and progress widgets into this route."
      />
    </DashboardTabScaffold>
  );
}
