import React from "react";
import { DashboardTabItem, DashboardTabValue } from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import { useMoreDashboardViewModel } from "../viewModel/moreDashboard.viewModel.impl";
import { MoreDashboardScreen } from "../ui/MoreDashboardScreen";

type GetMoreDashboardScreenFactoryProps = {
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  isBusinessMode: boolean;
  onTabPress: (tab: DashboardTabValue) => void;
  onOpenProfile: () => void;
  onOpenLedger: () => void;
  onOpenPos: () => void;
  onOpenEmi: () => void;
  onOpenTransactions: () => void;
  onOpenBudget: () => void;
};

export function GetMoreDashboardScreenFactory({
  activeTab,
  tabItems,
  isBusinessMode,
  onTabPress,
  onOpenProfile,
  onOpenLedger,
  onOpenPos,
  onOpenEmi,
  onOpenTransactions,
  onOpenBudget,
}: GetMoreDashboardScreenFactoryProps) {
  const viewModel = useMoreDashboardViewModel({
    activeTab,
    tabItems,
    isBusinessMode,
    onTabPress,
    onOpenProfile,
    onOpenLedger,
    onOpenPos,
    onOpenEmi,
    onOpenTransactions,
    onOpenBudget,
  });

  return <MoreDashboardScreen viewModel={viewModel} />;
}
