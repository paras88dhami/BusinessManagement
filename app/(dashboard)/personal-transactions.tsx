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

export default function PersonalTransactionsDashboardRoute() {
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
      title="Transactions"
      activeTab={DashboardTab.Transactions}
      tabItems={getDashboardTabItems(activeAccountType)}
      onTabPress={handleTabPress}
    >
      <DashboardInfoCard
        title="Personal Transactions"
        description="Track personal income and expenses with date filters and category-wise summaries in this tab."
      />
      <DashboardInfoCard
        title="Next"
        description="Attach your transaction list and add-transaction flow to this route for personal mode."
      />
    </DashboardTabScaffold>
  );
}
