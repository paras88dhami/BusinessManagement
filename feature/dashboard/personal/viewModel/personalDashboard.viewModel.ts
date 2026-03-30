import {
  DashboardTabItem,
  DashboardTabValue,
} from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import {
  PersonalDashboardQuickAction,
  PersonalDashboardRecentItem,
  PersonalDashboardSummaryCard,
} from "../types/personalDashboard.types";

export interface PersonalDashboardViewModel {
  greetingLabel: string;
  workspaceLabel: string;
  profileInitials: string;
  summaryCards: readonly PersonalDashboardSummaryCard[];
  quickActions: readonly PersonalDashboardQuickAction[];
  recentItems: readonly PersonalDashboardRecentItem[];
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  onTabPress: (tab: DashboardTabValue) => void;
  onProfilePress: () => void;
}

export type UsePersonalDashboardViewModelParams = {
  profileInitials: string;
  activeTab: DashboardTabValue;
  tabItems: readonly DashboardTabItem[];
  onTabPress: (tab: DashboardTabValue) => void;
  onProfilePress: () => void;
};
