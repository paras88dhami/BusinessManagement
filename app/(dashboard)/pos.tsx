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

export default function PosDashboardRoute() {
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
      title="POS"
      activeTab={DashboardTab.Pos}
      tabItems={getDashboardTabItems(activeAccountType)}
      onTabPress={handleTabPress}
    >
      <DashboardInfoCard
        title="POS Checkout"
        description="Use this tab for quick invoice and checkout flow. Navigation and tab state are fully wired."
      />
      <DashboardInfoCard
        title="Next"
        description="Attach product grid, cart summary and payment actions in this route without changing the tab architecture."
      />
    </DashboardTabScaffold>
  );
}
