import {
  DashboardTabItem,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import {
  BusinessDashboardDueItem,
  BusinessDashboardQuickAction,
  BusinessDashboardSummaryCard,
} from "../types/businessDashboard.types";

export interface BusinessDashboardViewModel {
  greetingLabel: string;
  workspaceLabel: string;
  profileInitials: string;
  summaryCards: readonly BusinessDashboardSummaryCard[];
  quickActions: readonly BusinessDashboardQuickAction[];
  dueItems: readonly BusinessDashboardDueItem[];
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  onTabPress: (tab: DashboardTabValue) => void;
  onProfilePress: () => void;
}

export type UseBusinessDashboardViewModelParams = {
  profileInitials: string;
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  onTabPress: (tab: DashboardTabValue) => void;
  onProfilePress: () => void;
};
