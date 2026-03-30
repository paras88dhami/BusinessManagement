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

export default function EmiLoansDashboardRoute() {
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
      title="EMI and Loans"
      activeTab={DashboardTab.Emi}
      tabItems={getDashboardTabItems(activeAccountType)}
      onTabPress={handleTabPress}
    >
      <DashboardInfoCard
        title="EMI Tracker"
        description="Track installments, pending dues and payment schedule from this tab for both personal and business modes."
      />
      <DashboardInfoCard
        title="Next"
        description="Connect EMI records, reminders and settlement actions in this route when you build the module."
      />
    </DashboardTabScaffold>
  );
}
