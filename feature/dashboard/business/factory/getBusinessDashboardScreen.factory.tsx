import React from "react";
import {
  DashboardTabItem,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import { useBusinessDashboardViewModel } from "../viewModel/businessDashboard.viewModel.impl";
import { BusinessDashboardScreen } from "../ui/BusinessDashboardScreen";

type GetBusinessDashboardScreenFactoryProps = {
  profileInitials: string;
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  onTabPress: (tab: DashboardTabValue) => void;
  onProfilePress: () => void;
};

export function GetBusinessDashboardScreenFactory({
  profileInitials,
  activeTab,
  tabItems,
  onTabPress,
  onProfilePress,
}: GetBusinessDashboardScreenFactoryProps) {
  const viewModel = useBusinessDashboardViewModel({
    profileInitials,
    activeTab,
    tabItems,
    onTabPress,
    onProfilePress,
  });

  return <BusinessDashboardScreen viewModel={viewModel} />;
}
