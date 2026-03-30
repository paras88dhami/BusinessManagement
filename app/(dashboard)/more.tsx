import React, { useCallback } from "react";
import { GetMoreDashboardScreenFactory } from "@/feature/dashboard/more/factory/getMoreDashboardScreen.factory";
import {
  DashboardTab,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import {
  getDashboardTabItems,
  getDashboardTabPath,
} from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function MoreDashboardRoute() {
  const navigation = useSmoothNavigation();
  const { activeAccountType } = useDashboardRouteContext();

  const handleTabPress = useCallback(
    (tab: DashboardTabValue) => {
      const targetPath = getDashboardTabPath(tab, activeAccountType);
      navigation.replace(targetPath);
    },
    [activeAccountType, navigation],
  );

  const handleOpenProfile = useCallback(() => {
    navigation.push("/(dashboard)/profile");
  }, [navigation]);

  const handleOpenLedger = useCallback(() => {
    navigation.replace("/(dashboard)/ledger");
  }, [navigation]);

  const handleOpenPos = useCallback(() => {
    navigation.replace("/(dashboard)/pos");
  }, [navigation]);

  const handleOpenEmi = useCallback(() => {
    navigation.replace("/(dashboard)/emi-loans");
  }, [navigation]);

  const handleOpenTransactions = useCallback(() => {
    navigation.replace("/(dashboard)/personal-transactions");
  }, [navigation]);

  const handleOpenBudget = useCallback(() => {
    navigation.replace("/(dashboard)/personal-budget");
  }, [navigation]);

  return (
    <GetMoreDashboardScreenFactory
      activeTab={DashboardTab.More}
      tabItems={getDashboardTabItems(activeAccountType)}
      isBusinessMode={activeAccountType === AccountType.Business}
      onTabPress={handleTabPress}
      onOpenProfile={handleOpenProfile}
      onOpenLedger={handleOpenLedger}
      onOpenPos={handleOpenPos}
      onOpenEmi={handleOpenEmi}
      onOpenTransactions={handleOpenTransactions}
      onOpenBudget={handleOpenBudget}
    />
  );
}
