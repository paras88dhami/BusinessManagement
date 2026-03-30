import React from "react";
import {
  DashboardTabItem,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import { usePersonalDashboardViewModel } from "../viewModel/personalDashboard.viewModel.impl";
import { PersonalDashboardScreen } from "../ui/PersonalDashboardScreen";

type GetPersonalDashboardScreenFactoryProps = {
  profileInitials: string;
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  onTabPress: (tab: DashboardTabValue) => void;
  onProfilePress: () => void;
};

export function GetPersonalDashboardScreenFactory({
  profileInitials,
  activeTab,
  tabItems,
  onTabPress,
  onProfilePress,
}: GetPersonalDashboardScreenFactoryProps) {
  const viewModel = usePersonalDashboardViewModel({
    profileInitials,
    activeTab,
    tabItems,
    onTabPress,
    onProfilePress,
  });

  return <PersonalDashboardScreen viewModel={viewModel} />;
}
