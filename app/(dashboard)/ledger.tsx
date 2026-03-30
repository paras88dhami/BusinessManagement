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

export default function LedgerDashboardRoute() {
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
      title="Ledger"
      activeTab={DashboardTab.Ledger}
      tabItems={getDashboardTabItems(activeAccountType)}
      onTabPress={handleTabPress}
    >
      <DashboardInfoCard
        title="Ledger Overview"
        description="Track payable and receivable balances here. This tab is ready for ledger list and party-level balances."
      />
      <DashboardInfoCard
        title="Next"
        description="Hook this page with party ledger entries and due-date filters to match your final production flow."
      />
    </DashboardTabScaffold>
  );
}
